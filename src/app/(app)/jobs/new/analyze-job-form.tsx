"use client";

import { useActionState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { analyzeJob, type AnalyzeJobState } from "../actions";

export function AnalyzeJobForm() {
  const [state, formAction, isPending] = useActionState<AnalyzeJobState, FormData>(
    analyzeJob,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" required disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roleTitle">Role title</Label>
          <Input id="roleTitle" name="roleTitle" required disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Optional"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salaryRange">Salary range</Label>
          <Input
            id="salaryRange"
            name="salaryRange"
            placeholder="Optional"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sourceUrl">Posting URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          placeholder="https://…"
          disabled={isPending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="jobDescription">Job description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          rows={14}
          disabled={isPending}
          placeholder="Paste the full job description here — or leave empty and provide a posting URL above for the strategist to fetch (pasting is more reliable; some job boards block fetching)."
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin" /> Analyzing — usually under a minute…
          </>
        ) : (
          <>
            <Sparkles /> Analyze fit
          </>
        )}
      </Button>
    </form>
  );
}
