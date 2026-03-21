import "@testing-library/jest-dom";

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  auth: jest.fn(() => Promise.resolve({ userId: "test_user_123" })),
  currentUser: jest.fn(() =>
    Promise.resolve({
      id: "test_user_123",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    }),
  ),
  ClerkProvider: ({ children }) => children,
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
}));

// Mock database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

// Mock AI service
jest.mock("@/lib/aiService", () => ({
  analyzeJobMatch: jest.fn(),
  generateCoverLetter: jest.fn(),
  generateInterviewPrep: jest.fn(),
  generateOptimization: jest.fn(),
  generateCareerDevelopment: jest.fn(),
}));

// Mock file processing
jest.mock("@/lib/fileProcessing", () => ({
  extractText: jest.fn(),
  validateFile: jest.fn(),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Warning: An update to"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
