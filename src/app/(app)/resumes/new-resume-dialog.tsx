"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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

import { createResumeVersion } from "./actions";

export function NewResumeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New resume version</DialogTitle>
          <DialogDescription>
            One version per role family you&apos;re targeting. Content comes
            next, on the edit page.
          </DialogDescription>
        </DialogHeader>
        <form action={createResumeVersion} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="roleFamily">Role family</Label>
            <Input
              id="roleFamily"
              name="roleFamily"
              required
              maxLength={60}
              placeholder="e.g. Growth Marketing"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              name="name"
              maxLength={120}
              placeholder="Defaults to “Role family Resume”"
            />
          </div>
          <Button type="submit" className="w-full">
            Create version
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
