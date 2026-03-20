import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>
          <p className="text-gray-600 mt-2">Get started with CareerCraft</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-700",
            },
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
