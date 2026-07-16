"use client";

import { useState, useSyncExternalStore } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useEveAgent } from "eve/react";
import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import type { EveMessagePart } from "eve/client";

import { getEveToken } from "@/lib/auth/client";
import { PageHeader } from "@/components/page-header";
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
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";

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

// "source_job_leads" → "Source job leads"
function toolTitle(toolName: string): string {
  const words = toolName.replaceAll(/[_-]/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
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

function MessagePartView({ part, role }: { part: EveMessagePart; role: "assistant" | "user" }) {
  if (part.type === "text") {
    return role === "user" ? (
      <MessageContent>{part.text}</MessageContent>
    ) : (
      <MessageContent>
        <MessageResponse>{part.text}</MessageResponse>
      </MessageContent>
    );
  }
  if (part.type === "dynamic-tool") {
    return (
      <Tool className="mb-0">
        <ToolHeader
          type="dynamic-tool"
          state={part.state}
          toolName={part.toolName}
          title={toolTitle(part.toolName)}
        />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput
            output={part.state === "output-available" ? part.output : undefined}
            errorText={part.state === "output-error" ? part.errorText : undefined}
          />
        </ToolContent>
      </Tool>
    );
  }
  if (part.type === "authorization") {
    return (
      <div className="w-fit rounded-md border px-4 py-3 text-sm">
        <p>
          {part.state === "required"
            ? `${part.displayName} needs authorization to continue.`
            : `${part.displayName} authorization ${part.outcome}.`}
        </p>
        {part.state === "required" && part.authorization?.url ? (
          <Button asChild size="sm" className="mt-2">
            <a href={part.authorization.url} target="_blank" rel="noreferrer">
              Authorize
              <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
        ) : null}
      </div>
    );
  }
  return null;
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

  // Cleared on submit so a stale error doesn't keep the submit button in its
  // error state for the whole next turn.
  const [dismissedError, setDismissedError] = useState<Error | null>(null);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const error = agent.error && agent.error !== dismissedError ? agent.error : null;

  const send = (message: string) => {
    const text = message.trim();
    if (text.length === 0 || isBusy) return;
    setDismissedError(agent.error ?? null);
    void agent.send({ message: text });
  };

  const resetChat = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    agent.reset();
  };

  return (
    <>
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-2xl gap-6 px-6 py-6">
          {agent.data.messages.length === 0 ? (
            <div className="flex flex-col items-start gap-4 pt-8">
              <p className="text-sm text-muted-foreground">
                Start with your positioning, a decision you&apos;re weighing,
                or what to build next.
              </p>
              <Suggestions>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Suggestion
                    key={prompt}
                    suggestion={prompt}
                    onClick={send}
                    className="hover:border-transparent hover:bg-block-lime hover:text-black dark:hover:bg-block-lime dark:hover:text-black"
                  />
                ))}
              </Suggestions>
            </div>
          ) : (
            agent.data.messages.map((message) => (
              <Message key={message.id} from={message.role} className="gap-1">
                <p className="eyebrow text-muted-foreground group-[.is-user]:text-right">
                  {message.role === "user" ? "You" : "Strategist"}
                </p>
                {message.parts.map((part, index) => (
                  <MessagePartView key={index} part={part} role={message.role} />
                ))}
              </Message>
            ))
          )}
          {agent.status === "submitted" ? (
            <p className="eyebrow animate-pulse text-muted-foreground">
              Thinking…
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive">
              Something went wrong: {error.message}
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
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
          <PromptInput
            onSubmit={(message: PromptInputMessage) => {
              send(message.text);
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask your strategist…"
                className="min-h-12"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                status={error ? "error" : agent.status}
                onStop={agent.stop}
                className="rounded-full"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
