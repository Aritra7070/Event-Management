import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VerifyEmailForm from "@/components/VerifyEmailForm";

export default async function VerifyEmailPage() {
  const s = await auth();

  if (!s?.user?.email) redirect("/login");

  return (
    <VerifyEmailForm
      email={s.user.email}
      name={s.user.name || "there"}
    />
  );
}