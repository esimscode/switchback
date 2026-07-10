"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { deleteResumeVersion } from "../actions";

export function DeleteResumeDialog({
  resumeVersionId,
  resumeName,
}: {
  resumeVersionId: string;
  resumeName: string;
}) {
  const [typed, setTyped] = useState("");
  const [state, formAction, isPending] = useActionState(
    deleteResumeVersion.bind(null, resumeVersionId),
    null,
  );
  const nameMatches = typed.trim() === resumeName;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-destructive">
          <Trash2 /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this resume version?</DialogTitle>
          <DialogDescription>
            This permanently removes <strong>{resumeName}</strong> and its
            content. Job analyses and applications that referenced it keep
            their data — only the resume link is cleared. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="confirmName">
              Type <span className="font-semibold">{resumeName}</span> to
              confirm
            </Label>
            <Input
              id="confirmName"
              name="confirmName"
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button
            type="submit"
            variant="destructive"
            disabled={!nameMatches || isPending}
            className="w-full"
          >
            {isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
