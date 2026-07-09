"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { MEMORY_CATEGORY_LABELS } from "@/lib/labels";

import { deleteMemory, saveMemory } from "./actions";

type MemoryInput = {
  id: string;
  key: string;
  value: string;
  category: string;
};

export function MemoryDialog({ memory }: { memory?: MemoryInput }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {memory ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${memory.key}`}>
            <Pencil />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New memory
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{memory ? "Edit memory" : "New memory"}</DialogTitle>
          <DialogDescription>
            Durable facts and rules the strategist applies in every conversation.
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await saveMemory(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {memory ? <input type="hidden" name="id" value={memory.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                name="key"
                required
                defaultValue={memory?.key ?? ""}
                placeholder="e.g. salary-floor"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={memory?.category ?? "PREFERENCE"}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMORY_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Memory</Label>
            <Textarea
              id="value"
              name="value"
              rows={4}
              required
              defaultValue={memory?.value ?? ""}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save memory</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteMemoryButton({ memoryId, memoryKey }: { memoryId: string; memoryKey: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${memoryKey}`}
        onClick={() => setConfirming(true)}
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <form
      action={async () => {
        await deleteMemory(memoryId);
        setConfirming(false);
      }}
      className="flex items-center gap-1"
    >
      <Button type="submit" variant="destructive" size="xs">
        Delete
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setConfirming(false)}
      >
        Keep
      </Button>
    </form>
  );
}
