"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUp, RotateCcw, Wrench } from "lucide-react";
import Markdown from "react-markdown";
import { useEveAgent } from "eve/react";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";

import { getEveToken } from "@/lib/auth/client";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "switchback-chat";
// Pre-rename key; drained into STORAGE_KEY on first read so saved chats survive.
const LEGACY_STORAGE_KEY = "career-strategist-chat";

const SUGGESTED_PROMPTS = [
  "What should I work on next?",
  "Run my weekly career review",
  "Help me decide if a role is worth applying to",
  "Turn a project into a case study",
  "Prep me for an interview",
];

type SavedChat = {
  events?: readonly HandleMessageStreamEvent[];
  session?: SessionState;
};

// localStorage is read once per page load; the server snapshot stays null so
// SSR and the first client render match, then the chat mounts with history.
let savedChatCache: SavedChat | null = null;
const emptySubscribe = () => () => {};

function readSavedChat(): SavedChat {
  if (savedChatCache === null) {
    try {
      let raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          window.localStorage.setItem(STORAGE_KEY, raw);
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
      savedChatCache = raw ? (JSON.parse(raw) as SavedChat) : {};
    } catch {
      savedChatCache = {};
    }
  }
  return savedChatCache;
}

export function StrategistChat() {
  const saved = useSyncExternalStore(emptySubscribe, readSavedChat, () => null);

  return (
    <div className="flex h-svh flex-col">
      <PageHeader
        title="Strategist Chat"
        description="A strategist who knows your positioning and protects your credibility."
      />
      {saved !== null ? <ChatSession saved={saved} /> : null}
    </div>
  );
}

function ChatSession({ saved }: { saved: SavedChat }) {
  const agent = useEveAgent({
    auth: { bearer: getEveToken },
    initialEvents: saved.events ?? [],
    initialSession: saved.session,
    onFinish(snapshot) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: snapshot.events, session: snapshot.session }),
      );
    },
  });

  const [draft, setDraft] = useState("");
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = agent.data.messages.length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, agent.status]);

  const send = (message: string) => {
    const text = message.trim();
    if (text.length === 0 || isBusy) return;
    setDraft("");
    void agent.send({ message: text });
  };

  const resetChat = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    agent.reset();
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {agent.data.messages.length === 0 ? (
            <div className="flex flex-col items-start gap-4 pt-8">
              <p className="text-sm text-muted-foreground">
                Start with your positioning, a decision you&apos;re weighing,
                or what to build next.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => send(prompt)}
                    className="hover:border-transparent hover:bg-block-lime hover:text-black dark:hover:bg-block-lime dark:hover:text-black"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            agent.data.messages.map((message) => (
              <article key={message.id} className="space-y-2">
                <p className="eyebrow text-muted-foreground">
                  {message.role === "user" ? "You" : "Strategist"}
                </p>
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return message.role === "user" ? (
                      <p
                        key={index}
                        className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm"
                      >
                        {part.text}
                      </p>
                    ) : (
                      <div
                        key={index}
                        className="prose prose-sm max-w-none dark:prose-invert"
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    );
                  }
                  if (
                    part.type === "dynamic-tool" ||
                    part.type.startsWith("tool-")
                  ) {
                    const toolPart = part as { toolName?: string; state?: string };
                    return (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Wrench data-icon="inline-start" />
                        {toolPart.toolName ?? "tool"}
                        <span className="text-muted-foreground">
                          {toolPart.state === "output-available" ||
                          toolPart.state === "output-error"
                            ? "· done"
                            : "· running"}
                        </span>
                      </Badge>
                    );
                  }
                  return null;
                })}
              </article>
            ))
          )}
          {agent.status === "submitted" ? (
            <p className="eyebrow animate-pulse text-muted-foreground">
              Thinking…
            </p>
          ) : null}
          {agent.error ? (
            <p className="text-sm text-destructive">
              Something went wrong: {agent.error.message}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t bg-background px-6 py-4">
        <form
          className="mx-auto flex max-w-2xl items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          {agent.data.messages.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 self-center text-muted-foreground"
                >
                  <RotateCcw />
                  New chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Start a new chat?</DialogTitle>
                  <DialogDescription>
                    This clears the current conversation. The strategist keeps
                    its saved memories — only this thread goes away.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Keep chatting
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="button" onClick={resetChat}>
                      Clear and start fresh
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask your strategist…"
            disabled={isBusy}
            rows={1}
            className="max-h-40 min-h-10 resize-none rounded-3xl px-4 py-2.5 field-sizing-content"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={isBusy || draft.trim().length === 0}
            className="size-10"
          >
            <ArrowUp />
          </Button>
        </form>
      </div>
    </>
  );
}
