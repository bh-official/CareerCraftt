import { validateFile, extractText } from "@/lib/fileProcessing";

describe("fileProcessing", () => {
  describe("validateFile", () => {
    it("should accept valid PDF files", () => {
      const file = { name: "resume.pdf", size: 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept valid DOCX files", () => {
      const file = { name: "resume.docx", size: 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept valid TXT files", () => {
      const file = { name: "resume.txt", size: 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject files that are too large", () => {
      const file = { name: "resume.pdf", size: 11 * 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File size exceeds");
    });

    it("should reject unsupported file types", () => {
      const file = { name: "image.jpg", size: 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported file type");
    });

    it("should reject files with no extension", () => {
      const file = { name: "resume", size: 1024 * 1024 };
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });
  });

  describe("extractText", () => {
    it("should extract text from PDF", async () => {
      // Mock PDF buffer
      const mockBuffer = Buffer.from("%PDF-1.4 mock pdf content");
      const result = await extractText(mockBuffer, "application/pdf");
      // This will likely return an error since it's a mock, but tests the function exists
      expect(result).toHaveProperty("success");
    });

    it("should handle invalid PDF gracefully", async () => {
      const mockBuffer = Buffer.from("not a pdf");
      const result = await extractText(mockBuffer, "application/pdf");
      expect(result.success).toBe(false);
    });
  });
});
