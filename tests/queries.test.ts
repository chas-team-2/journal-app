import { getEntries, createEntry } from "../src/lib/supabase/queries";

// Mock the server-side Supabase client factory used inside queries.ts
jest.mock("../src/lib/supabase/server", () => {
    const auth = { getUser: jest.fn() };
    const from = jest.fn();
    const client = { auth, from };
    return {
        createClient: jest.fn(async () => client),
        __client: client, // exposed for test control
    };
});

type SupabaseClientMock = {
    auth: { getUser: jest.Mock };
    from: jest.Mock;
};

const { __client } = jest.requireMock("../src/lib/supabase/server") as {
    __client: SupabaseClientMock;
};

describe("queries.ts", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getEntries", () => {
        // Propagates Supabase error when not authenticated (RLS).
        test("throws when user is not authenticated", async () => {
            const builder = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error("User not authenticated"),
                }),
            };
            __client.from.mockReturnValue(builder);

            await expect(getEntries()).rejects.toThrow(
                "User not authenticated"
            );
        });

        // Returns entries ordered by created_at when successful.
        test("returns entries for authenticated user", async () => {
            const builder = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        {
                            id: 2,
                            user_id: "uid-1",
                            title: "B",
                            content: "c2",
                            created_at: "t2",
                        },
                        {
                            id: 1,
                            user_id: "uid-1",
                            title: "A",
                            content: "c1",
                            created_at: "t1",
                        },
                    ],
                    error: null,
                }),
            };
            __client.from.mockReturnValue(builder);

            const result = await getEntries();
            expect(__client.from).toHaveBeenCalledWith("entries");
            expect(builder.select).toHaveBeenCalledWith("*");
            expect(builder.order).toHaveBeenCalledWith("created_at", {
                ascending: false,
            });
            expect(result).toHaveLength(2);
        });

        // Resolves to an empty list when the database returns no rows.
        test("returns empty array when no data", async () => {
            const builder = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: null }),
            };
            __client.from.mockReturnValue(builder);

            const result = await getEntries();
            expect(result).toEqual([]);
        });

        // Surfaces and throws the underlying Supabase error when the query fails.
        test("throws when Supabase returns error", async () => {
            const builder = {
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error("db failure"),
                }),
            };
            __client.from.mockReturnValue(builder);

            await expect(getEntries()).rejects.toThrow("db failure");
        });
    });

    describe("createEntry", () => {
        // Validates that creating an entry requires an authenticated user.
        test("throws when user is not authenticated", async () => {
            __client.auth.getUser.mockResolvedValue({ data: { user: null } });
            await expect(
                createEntry({ title: "T", content: "C" })
            ).rejects.toThrow("User not authenticated");
        });

        // Inserts a new entry with prefixed title and returns the created row.
        test("inserts entry with prefixed title and returns created row", async () => {
            __client.auth.getUser.mockResolvedValue({
                data: { user: { id: "uid-4" } },
            });

            const single = jest.fn().mockResolvedValue({
                data: {
                    id: 10,
                    user_id: "uid-4",
                    title: "Title är: T",
                    content: "C",
                    created_at: "now",
                },
                error: null,
            });
            const select = jest.fn().mockReturnValue({ single });
            const insert = jest.fn().mockReturnValue({ select });

            __client.from.mockReturnValue({ insert });

            const created = await createEntry({ title: "T", content: "C" });

            expect(__client.from).toHaveBeenCalledWith("entries");
            expect(insert).toHaveBeenCalledWith([
                expect.objectContaining({
                    user_id: "uid-4",
                    title: "Title är: T",
                    content: "C",
                }),
            ]);
            expect(created).toEqual({
                id: 10,
                user_id: "uid-4",
                title: "Title är: T",
                content: "C",
                created_at: "now",
            });
        });

        // Propagates insert errors from Supabase when creation fails.
        test("throws when Supabase insert errors", async () => {
            __client.auth.getUser.mockResolvedValue({
                data: { user: { id: "uid-5" } },
            });

            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("insert failed"),
            });
            const select = jest.fn().mockReturnValue({ single });
            const insert = jest.fn().mockReturnValue({ select });
            __client.from.mockReturnValue({ insert });

            await expect(
                createEntry({ title: "A", content: "B" })
            ).rejects.toThrow("insert failed");
        });
    });
});
