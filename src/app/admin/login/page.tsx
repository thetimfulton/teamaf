import { LoginForm } from "./login-form";
import { getAdminUser } from "@/lib/supabase/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // If already authenticated as admin, redirect to dashboard
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            #teamAF Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to manage the wedding
          </p>
        </div>
        <LoginForm errorParam={params.error} />
      </div>
    </div>
  );
}
