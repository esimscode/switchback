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
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";

import { createApplication } from "./actions";

export function NewApplicationDialog({
  resumeVersions,
}: {
  resumeVersions: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New application</DialogTitle>
          <DialogDescription>
            Track a role you saved or applied to.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await createApplication(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roleTitle">Role title</Label>
              <Input id="roleTitle" name="roleTitle" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roleFamily">Role family</Label>
              <Input
                id="roleFamily"
                name="roleFamily"
                placeholder="e.g. Platform Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="SAVED">
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPLICATION_STATUS_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resumeVersionId">Resume version</Label>
              <Select name="resumeVersionId">
                <SelectTrigger id="resumeVersionId" className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {resumeVersions.map((rv) => (
                    <SelectItem key={rv.id} value={rv.id}>
                      {rv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateApplied">Date applied</Label>
              <Input id="dateApplied" name="dateApplied" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source</Label>
              <Input id="source" name="source" placeholder="e.g. LinkedIn" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryRange">Salary range</Label>
              <Input id="salaryRange" name="salaryRange" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link">Job link</Label>
            <Input id="link" name="link" type="url" placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save application</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
