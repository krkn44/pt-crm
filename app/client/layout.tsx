import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-better";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/trainer/dashboard");
  }

  return (
    <div className="flex h-screen">
      <Sidebar role="CLIENT" />
      <main className="flex-1 overflow-auto bg-background pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
