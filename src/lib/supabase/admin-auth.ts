import { redirect } from "next/navigation";
import { createClient } from "./server";

function getAdminEmailsList(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const allowed = getAdminEmailsList();
  if (!allowed.includes(user.email.toLowerCase())) return null;

  return { id: user.id, email: user.email };
}

export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
