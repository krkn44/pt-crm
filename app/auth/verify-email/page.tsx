"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("Missing verification token");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        if (response.ok) {
          setStatus("success");
          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push("/auth/signin");
          }, 3000);
        } else {
          const data = await response.json().catch(() => ({}));
          setStatus("error");
          if (data.message?.includes("expired")) {
            setErrorMessage("The verification link has expired. Please sign up again.");
          } else if (data.message?.includes("invalid")) {
            setErrorMessage("The verification link is invalid.");
          } else {
            setErrorMessage(data.message || "Error during email verification");
          }
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Verified!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-900/20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              Your account has been verified successfully. Redirecting to login...
            </AlertDescription>
          </Alert>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verification Failed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-red-900/20 border-red-800">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            {errorMessage}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/signup")}
          >
            Sign up again
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
