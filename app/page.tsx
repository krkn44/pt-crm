import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-better";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();

  // If user is authenticated, redirect to appropriate dashboard
  if (session?.user) {
    if (session.user.role === "TRAINER") {
      redirect("/trainer/dashboard");
    } else {
      redirect("/client/workout");
    }
  }

  // If not authenticated, show landing page with login link
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">PT CRM</h1>
        <p className="text-muted-foreground text-lg">
          Personal trainer management system
        </p>
        <Link href="/auth/signin">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
