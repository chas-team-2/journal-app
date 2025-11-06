import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { apiGetCurrentUser } from "@/lib/api/auth";
import { apiGetEntries } from "@/lib/api/entries";
import { useRouter } from "next/navigation";
import { Entry } from "@/types";

// Mock dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

jest.mock("@/lib/api/auth", () => ({
    apiGetCurrentUser: jest.fn(),
}));

jest.mock("@/lib/api/entries", () => ({
    apiGetEntries: jest.fn(),
}));

jest.mock("@/components/Header", () => {
    return function MockHeader() {
        return <header data-testid="header">Header</header>;
    };
});

jest.mock("@/components/EntryCard", () => {
    return function MockEntryCard({ entry }: { entry: Entry }) {
        return <div data-testid="entry-card">{entry.title}</div>;
    };
});

jest.mock("next/link", () => {
    return function MockLink({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) {
        return <a href={href}>{children}</a>;
    };
});

describe("DashboardPage", () => {
    const mockPush = jest.fn();
    const mockRouter = {
        push: mockPush,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    describe("Redirect when not authenticated", () => {
        // Ensures unauthenticated users are redirected to /login.
        it("redirects to /login if user is not logged in", async () => {
            (apiGetCurrentUser as jest.Mock).mockResolvedValue(null);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith("/login");
            });
        });
    });

    describe("Loading state", () => {
        // Shows a temporary loading indicator while user and entries are fetched.
        it("displays loading state initially", async () => {
            const mockUser = { id: "user-1", email: "test@example.com" };
            (apiGetCurrentUser as jest.Mock).mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve(mockUser), 100)
                    )
            );
            (apiGetEntries as jest.Mock).mockImplementation(
                () =>
                    new Promise((resolve) => setTimeout(() => resolve([]), 200))
            );

            render(<DashboardPage />);

            // Should show loading text initially
            expect(screen.getByText("Loading...")).toBeInTheDocument();

            // Wait for loading to complete
            await waitFor(() => {
                expect(
                    screen.queryByText("Loading...")
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("Display entries", () => {
        // Renders a list of entries for the authenticated user and shows the count.
        it("displays entries after successful load", async () => {
            const mockUser = { id: "user-1", email: "test@example.com" };
            const mockEntries = [
                {
                    id: "1",
                    user_id: "user-1",
                    title: "First Entry",
                    content: "Content of first entry",
                    created_at: "2024-01-01T00:00:00Z",
                },
                {
                    id: "2",
                    user_id: "user-1",
                    title: "Second Entry",
                    content: "Content of second entry",
                    created_at: "2024-01-02T00:00:00Z",
                },
            ];

            (apiGetCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (apiGetEntries as jest.Mock).mockResolvedValue(mockEntries);

            render(<DashboardPage />);

            // Wait for entries to load
            await waitFor(() => {
                expect(screen.getByText("First Entry")).toBeInTheDocument();
            });

            // Should display both entries
            expect(screen.getByText("First Entry")).toBeInTheDocument();
            expect(screen.getByText("Second Entry")).toBeInTheDocument();

            // Should show entry count
            expect(screen.getByText("2 entries")).toBeInTheDocument();

            // Should render EntryCard components
            const entryCards = screen.getAllByTestId("entry-card");
            expect(entryCards).toHaveLength(2);
        });

        // Shows an empty state and zero count when the user has no entries.
        it("displays empty state when no entries exist", async () => {
            const mockUser = { id: "user-1", email: "test@example.com" };
            (apiGetCurrentUser as jest.Mock).mockResolvedValue(mockUser);
            (apiGetEntries as jest.Mock).mockResolvedValue([]);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(
                    screen.getByText("You haven't written any entries yet.")
                ).toBeInTheDocument();
            });

            expect(screen.getByText("0 entries")).toBeInTheDocument();
            expect(
                screen.getByText("Write your first entry")
            ).toBeInTheDocument();
        });
    });
});
