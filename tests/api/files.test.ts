import { uploadEntryFile, deleteEntryFile, getEntryFileUrl } from "../../src/lib/api/files";
import { sanitizeFilename } from "../../src/lib/utils/sanitizeFilename";

// Mock the server-side Supabase client
jest.mock("../../src/lib/supabase/server", () => {
  const auth = { getUser: jest.fn() };
  const storage = {
    from: jest.fn(() => ({
      list: jest.fn(),
      upload: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  };
  const from = jest.fn();
  const client = { auth, from, storage };
  return {
    createClient: jest.fn(async () => client),
    __client: client,
  };
});

type SupabaseClientMock = {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
  storage: {
    from: jest.Mock;
  };
};

const { __client } = jest.requireMock("../../src/lib/supabase/server") as {
  __client: SupabaseClientMock;
};

// Helper to create a mock File
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe("files.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Suppress console.error during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe("sanitizeFilename", () => {
    test("accepts valid PDF filename", () => {
      const result = sanitizeFilename("document-2024_v1.pdf");
      expect(result.isValid).toBe(true);
      expect(result.filename).toBe("document-2024_v1.pdf");
      expect(result.wasModified).toBe(false);
    });

    test("sanitizes filename with spaces and special characters", () => {
      const result = sanitizeFilename("My Report (Final).pdf");
      expect(result.isValid).toBe(true);
      expect(result.filename).toBe("My_Report_Final_.pdf");
      expect(result.wasModified).toBe(true);
    });

    test("prevents directory traversal", () => {
      const result = sanitizeFilename("../../etc/passwd.pdf");
      expect(result.isValid).toBe(true);
      expect(result.filename).toBe("_._etc_passwd.pdf");
      expect(result.wasModified).toBe(true);
    });

    test("rejects Windows reserved names", () => {
      const result = sanitizeFilename("CON.pdf");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("reserved by Windows");
    });

    test("rejects empty filename", () => {
      const result = sanitizeFilename("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Filename cannot be empty");
    });

    test("handles very long filenames", () => {
      const longName = "a".repeat(300) + ".pdf";
      const result = sanitizeFilename(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum length");
    });
  });

  describe("uploadEntryFile", () => {
    test("throws when user is not authenticated", async () => {
      __client.auth.getUser.mockResolvedValue({ 
        data: { user: null },
        error: new Error("Not authenticated")
      });

      const file = createMockFile("test.pdf", 1000, "application/pdf");
      
      await expect(uploadEntryFile(file, "entry-1")).rejects.toThrow("Unauthorized");
    });

    test("throws when file type is not PDF", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const file = createMockFile("test.txt", 1000, "text/plain");
      
      await expect(uploadEntryFile(file, "entry-1")).rejects.toThrow(
        "Only PDF files are allowed"
      );
    });

    test("throws when file size exceeds 2MB", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const file = createMockFile("large.pdf", 3 * 1024 * 1024, "application/pdf");
      
      await expect(uploadEntryFile(file, "entry-1")).rejects.toThrow(
        "File is too large (max 2MB)"
      );
    });

    test("throws when entry does not belong to user", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-2" }, // Different user
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const file = createMockFile("test.pdf", 1000, "application/pdf");
      
      await expect(uploadEntryFile(file, "entry-1")).rejects.toThrow(
        "Entry not found or unauthorized"
      );
    });

    test("successfully uploads PDF file", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      // Mock entry ownership check
      const entryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(entryBuilder);

      // Mock storage operations
      const storageList = jest.fn().mockResolvedValue({ 
        data: [],
        error: null 
      });
      const storageUpload = jest.fn().mockResolvedValue({ 
        data: { path: "user-1/entry-1/test.pdf" },
        error: null 
      });
      const storageCreateSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://storage.url/signed" },
        error: null,
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        upload: storageUpload,
        createSignedUrl: storageCreateSignedUrl,
      });

      const file = createMockFile("test.pdf", 1000, "application/pdf");
      const result = await uploadEntryFile(file, "entry-1");

      expect(storageList).toHaveBeenCalledWith("user-1/entry-1");
      expect(storageUpload).toHaveBeenCalledWith(
        "user-1/entry-1/test.pdf",
        file,
        expect.any(Object)
      );
      expect(result).toEqual({
        fileName: "test.pdf",
        fileUrl: "https://storage.url/signed",
      });
    });

    test("replaces existing file when uploading", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const entryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(entryBuilder);

      // Mock existing file
      const storageList = jest.fn().mockResolvedValue({ 
        data: [{ name: "old.pdf" }],
        error: null 
      });
      const storageRemove = jest.fn().mockResolvedValue({ 
        data: null,
        error: null 
      });
      const storageUpload = jest.fn().mockResolvedValue({ 
        data: { path: "user-1/entry-1/new.pdf" },
        error: null 
      });
      const storageCreateSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://storage.url/new" },
        error: null,
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        remove: storageRemove,
        upload: storageUpload,
        createSignedUrl: storageCreateSignedUrl,
      });

      const file = createMockFile("new.pdf", 1000, "application/pdf");
      await uploadEntryFile(file, "entry-1");

      expect(storageRemove).toHaveBeenCalledWith(["user-1/entry-1/old.pdf"]);
    });

    test("throws when upload fails", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const entryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(entryBuilder);

      const storageList = jest.fn().mockResolvedValue({ data: [], error: null });
      const storageUpload = jest.fn().mockResolvedValue({ 
        data: null,
        error: { message: "Storage error" }
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        upload: storageUpload,
      });

      const file = createMockFile("test.pdf", 1000, "application/pdf");
      
      await expect(uploadEntryFile(file, "entry-1")).rejects.toThrow(
        "Upload failed: Storage error"
      );
    });
  });

  describe("deleteEntryFile", () => {
    test("throws when user is not authenticated", async () => {
      __client.auth.getUser.mockResolvedValue({ 
        data: { user: null },
        error: new Error("Not authenticated")
      });

      await expect(deleteEntryFile("entry-1")).rejects.toThrow("Unauthorized");
    });

    test("throws when entry does not belong to user", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-2" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      await expect(deleteEntryFile("entry-1")).rejects.toThrow(
        "Entry not found or unauthorized"
      );
    });

    test("throws when no file exists to delete", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const storageList = jest.fn().mockResolvedValue({ 
        data: [],
        error: null 
      });

      __client.storage.from.mockReturnValue({ list: storageList });

      await expect(deleteEntryFile("entry-1")).rejects.toThrow("No file to delete");
    });

    test("successfully deletes file", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const storageList = jest.fn().mockResolvedValue({ 
        data: [{ name: "test.pdf" }],
        error: null 
      });
      const storageRemove = jest.fn().mockResolvedValue({ 
        data: null,
        error: null 
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        remove: storageRemove,
      });

      await deleteEntryFile("entry-1");

      expect(storageList).toHaveBeenCalledWith("user-1/entry-1");
      expect(storageRemove).toHaveBeenCalledWith(["user-1/entry-1/test.pdf"]);
    });
  });

  describe("getEntryFileUrl", () => {
    test("throws when user is not authenticated", async () => {
      __client.auth.getUser.mockResolvedValue({ 
        data: { user: null },
        error: new Error("Not authenticated")
      });

      await expect(getEntryFileUrl("entry-1")).rejects.toThrow("Unauthorized");
    });

    test("throws when entry does not belong to user", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-2" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      await expect(getEntryFileUrl("entry-1")).rejects.toThrow(
        "Entry not found or unauthorized"
      );
    });

    test("returns null when no file exists", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const storageList = jest.fn().mockResolvedValue({ 
        data: [],
        error: null 
      });

      __client.storage.from.mockReturnValue({ list: storageList });

      const result = await getEntryFileUrl("entry-1");
      expect(result).toBeNull();
    });

    test("returns file info with signed URL", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const storageList = jest.fn().mockResolvedValue({ 
        data: [{ name: "document.pdf" }],
        error: null 
      });
      const storageCreateSignedUrl = jest.fn().mockResolvedValue({
        data: { signedUrl: "https://storage.url/signed/document.pdf" },
        error: null,
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        createSignedUrl: storageCreateSignedUrl,
      });

      const result = await getEntryFileUrl("entry-1");

      expect(result).toEqual({
        fileName: "document.pdf",
        fileUrl: "https://storage.url/signed/document.pdf",
      });
      expect(storageCreateSignedUrl).toHaveBeenCalledWith(
        "user-1/entry-1/document.pdf",
        3600
      );
    });

    test("returns null when signed URL creation fails", async () => {
      __client.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: "user-1" },
          error: null,
        }),
      };
      __client.from.mockReturnValue(builder);

      const storageList = jest.fn().mockResolvedValue({ 
        data: [{ name: "test.pdf" }],
        error: null 
      });
      const storageCreateSignedUrl = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Failed to create URL" },
      });

      __client.storage.from.mockReturnValue({
        list: storageList,
        createSignedUrl: storageCreateSignedUrl,
      });

      const result = await getEntryFileUrl("entry-1");
      expect(result).toBeNull();
    });
  });
});
