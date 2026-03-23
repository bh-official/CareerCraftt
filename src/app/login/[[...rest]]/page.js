"use client";

import { useEffect } from "react";
import { useAuth, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthLayout, { AuthLoadingScreen } from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  if (userId) return null;

  return (
    <AuthLayout>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            formFieldInput: "border-gray-300 focus:ring-blue-500",
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        redirectUrl="/dashboard"
      />
    </AuthLayout>
  );
}
