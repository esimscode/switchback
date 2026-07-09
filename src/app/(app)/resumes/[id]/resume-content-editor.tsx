"use client";

import { useState } from "react";
import Markdown from "react-markdown";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Client half of the resume editor: an Edit/Preview toggle over the markdown
// content. The textarea stays mounted (hidden on the preview tab) so the
// surrounding server-action form always submits the current value.
export function ResumeContentEditor({
  defaultValue,
  placeholder,
}: {
  defaultValue: string;
  placeholder: string;
}) {
  const [content, setContent] = useState(defaultValue);

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="edit" forceMount className="data-[state=inactive]:hidden">
        <Textarea
          name="content"
          rows={24}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={placeholder}
          className="font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview">
        {content.trim().length > 0 ? (
          <div className="prose prose-sm max-w-none rounded-lg border px-4 py-3 dark:prose-invert">
            <Markdown>{content}</Markdown>
          </div>
        ) : (
          <p className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
            Nothing to preview yet — add your resume content on the Edit tab.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
