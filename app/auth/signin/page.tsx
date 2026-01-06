"use client";

import { Suspense, useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // Get session to determine role
      const sessionRes = await fetch("/api/auth/get-session");
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        const role = session?.user?.role;

        // Redirect to the original page or role-based dashboard
        const from = searchParams.get("from");
        if (from) {
          router.push(from);
        } else {
          // Redirect based on role
          const dashboardUrl = role === "TRAINER" ? "/trainer/dashboard" : "/client/workout";
          router.push(dashboardUrl);
        }
      } else {
        // Fallback to home if session fetch fails
        router.push("/client/workout");
      }
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <a
            href="/auth/forgot-password"
            className="hover:text-primary transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            className="text-primary hover:underline"
          >
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}
