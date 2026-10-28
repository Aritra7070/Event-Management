import {auth} from "@/auth";
import {redirect} from "next/navigation";
// Intentionally a placeholder: replace this content when the event dashboard is ready.
export default async function DashboardPage(){
    const s=await auth();
    if(!s?.user?.email)
        redirect("/login");
    return <main className="min-h-screen bg-[#090910] p-8 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[.25em] text-violet-200">Eventora workspace</p>
        <h1 className="mt-3 text-3xl font-semibold">Dashboard placeholder</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Authentication and email verification are complete. Build your event dashboard here when ready.</p>
        <p className="mt-6 text-sm text-slate-300">Signed in as {s.user.email}</p>
        </div>
        </main>
}
