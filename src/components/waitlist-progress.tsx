// Interest tracker for the cloud-plan waitlist. Presentational and server-safe
// — the landing page (force-dynamic) passes a fresh count each render.
//
// Below `floor` the tracker stays understated (no count, no bar) so an early
// low number never reads as weak traction; once interest clears the floor it
// unlocks with social-proof framing. At `goal` the hosted plan is greenlit.
export function WaitlistProgress({
  count,
  goal,
  floor = 25,
}: {
  count: number;
  goal: number;
  floor?: number;
}) {
  const reached = count >= goal;

  if (count < floor && !reached) {
    return (
      <p className="mb-5 text-sm font-medium">
        Be one of the first to register your interest.
      </p>
    );
  }

  const pct = Math.min(100, (count / goal) * 100);

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">
          {reached
            ? "Goal reached — cloud plan greenlit"
            : `🔥 ${count.toLocaleString()} people are already interested`}
        </span>
        <span className="tabular-nums opacity-70">
          {count.toLocaleString()} / {goal.toLocaleString()}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-black/15"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label="Cloud plan interest toward launch goal"
      >
        <div
          className="h-full rounded-full bg-black transition-[width] duration-500"
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>
      <p className="mt-2 text-xs opacity-70">
        {reached
          ? "We hit the interest goal — building the hosted plan and reaching out to everyone who registered."
          : `Join them — when ${goal.toLocaleString()} people register interest, we build the hosted cloud plan.`}
      </p>
    </div>
  );
}
