import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SwitchbackMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "@/components/waitlist-form";
import { WaitlistProgress } from "@/components/waitlist-progress";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Interested-signup target that greenlights building the hosted cloud plan.
const WAITLIST_GOAL = 100;

// Public landing page. Signed-in users go straight to their workspace;
// everyone else gets the pitch, the self-host path, and the cloud waitlist.
export default async function Home() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    const users = await prisma.user.count();
    redirect(users === 0 ? "/welcome" : "/dashboard");
  }

  const interestedCount = await prisma.waitlistSignup.count();

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2">
          <SwitchbackMark className="size-5" strokeWidth={13} />
          <span className="text-sm font-semibold tracking-tight">
            switchback
          </span>
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <SwitchbackMark className="size-14" />
        <div className="max-w-2xl space-y-4">
          <p className="eyebrow">Same mountain. Higher ground.</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A career strategist that never oversells you.
          </h1>
          <p className="mx-auto max-w-xl text-balance text-muted-foreground">
            Switchback turns scattered career activity — positioning, resume
            versions, job analyses, applications, projects — into a compounding
            system, with an AI strategist that knows your story and protects
            your credibility. Honest fit calls. Gaps named candidly. Never an
            invented bullet point.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          {/* preload="none" keeps the 9.7 MB demo off the critical path; the
              poster carries the first paint until a click. */}
          <video
            controls
            preload="none"
            playsInline
            poster="/demo-poster.jpg"
            className="w-full rounded-2xl border shadow-sm"
            aria-label="Switchback product demo"
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser doesn&apos;t support embedded video.
          </video>
        </div>

        <div className="w-full max-w-2xl rounded-2xl bg-block-lime p-8 text-left text-black">
          <p className="eyebrow mb-2">Cloud plan — early interest</p>
          <h2 className="mb-2 text-xl font-semibold tracking-tight">
            Want Switchback without running your own deployment?
          </h2>
          <p className="mb-5 text-sm">
            A hosted version is under consideration. Register your interest to
            help us reach the goal — no spam, ever. We&apos;ll only reach out to
            interested folks for honest feedback on how a hosted plan should
            work for you.
          </p>
          <WaitlistProgress count={interestedCount} goal={WAITLIST_GOAL} />
          <WaitlistForm />
        </div>

        <p className="text-sm text-muted-foreground">
          Prefer to run your own? It&apos;s open source —{" "}
          <a
            href="https://github.com/esimscode/switchback"
            className="inline-flex items-center gap-1 underline underline-offset-4"
          >
            deploy from GitHub <ArrowRight className="size-3.5" />
          </a>
        </p>
      </section>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Not a resume generator, not a job board — a trusted strategist
        workspace.
      </footer>
    </main>
  );
}
