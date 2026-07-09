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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REFLECTION_TYPE_LABELS } from "@/lib/labels";

import { createReflection } from "./actions";

export function NewReflectionDialog({
  projects,
  applications,
}: {
  projects: { id: string; name: string }[];
  applications: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New reflection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New reflection</DialogTitle>
          <DialogDescription>
            Decisions, blockers, opportunities, weekly focus — worth keeping.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createReflection(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reflectionType">Type</Label>
              <Select name="reflectionType" defaultValue="WEEKLY_CHECKIN">
                <SelectTrigger id="reflectionType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REFLECTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mood">Mood</Label>
              <Input id="mood" name="mood" placeholder="Optional" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Reflection</Label>
            <Textarea id="body" name="body" rows={5} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="relatedProjectId">Related project</Label>
              <Select name="relatedProjectId">
                <SelectTrigger id="relatedProjectId" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relatedApplicationId">Related application</Label>
              <Select name="relatedApplicationId">
                <SelectTrigger id="relatedApplicationId" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((application) => (
                    <SelectItem key={application.id} value={application.id}>
                      {application.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save reflection</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
