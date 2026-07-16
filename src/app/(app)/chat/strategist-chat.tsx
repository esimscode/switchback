"use client";

import { useState, useSyncExternalStore } from "react";
import { ExternalLink, Paperclip, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { FileUIPart, UserContent } from "ai";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
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

// eve's send accepts AI SDK UserContent, so attachments travel as file parts
// with data: URLs (PromptInput converts blobs before onSubmit fires). Images
// go as 'file' parts too — eve's endpoint rejects 'image' parts.
function toUserContent(text: string, files: FileUIPart[]): string | UserContent {
  if (files.length === 0) return text;
  return [
    ...(text.length > 0 ? [{ type: "text" as const, text }] : []),
    ...files.map((file) => ({
      type: "file" as const,
      data: file.url,
      mediaType: file.mediaType ?? "application/octet-stream",
      filename: file.filename,
    })),
  ];
}

export function StrategistChat() {
  const saved = useSyncExternalStore(emptySubscribe, readSavedChat, () => null);
  // Bumping the key remounts ChatSession, which recreates the eve agent store
  // from the (now cleared) saved snapshot — the equivalent of agent.reset().
  const [sessionKey, setSessionKey] = useState(0);

  const resetChat = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    savedChatCache = {};
    setSessionKey((key) => key + 1);
  };

  return (
    <div className="flex h-svh flex-col">
      <PageHeader
        title="Strategist Chat"
        description="A strategist who knows your positioning and protects your credibility."
        actions={<NewChatButton onConfirm={resetChat} />}
      />
      {saved !== null ? <ChatSession key={sessionKey} saved={saved} /> : null}
    </div>
  );
}

function NewChatButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="New chat"
              className="rounded-full text-muted-foreground"
            >
              <RotateCcw />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>New chat</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Start a new chat?</DialogTitle>
          <DialogDescription>
            This clears the current conversation. The strategist keeps its
            saved memories — only this thread goes away.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Keep chatting
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={onConfirm}>
              Clear and start fresh
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

// Both must render inside PromptInput — the attachments hook reads its context.
function AttachmentsRow() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

function AttachButton() {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputButton
      aria-label="Attach image or PDF"
      tooltip="Attach image or PDF"
      onClick={() => attachments.openFileDialog()}
    >
      <Paperclip />
    </PromptInputButton>
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

  // Cleared on submit so a stale error doesn't keep the submit button in its
  // error state for the whole next turn.
  const [dismissedError, setDismissedError] = useState<Error | null>(null);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const error = agent.error && agent.error !== dismissedError ? agent.error : null;

  const send = (message: string, files: FileUIPart[] = []) => {
    const text = message.trim();
    if ((text.length === 0 && files.length === 0) || isBusy) return;
    setDismissedError(agent.error ?? null);
    void agent.send({ message: toUserContent(text, files) });
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
        {/* Messages fade out as they slide behind the input area. Rendered
            before the scroll button so the button stays crisp above it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent backdrop-blur-[1px] [mask-image:linear-gradient(to_top,black_25%,transparent)]" />
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t bg-background px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <PromptInput
            accept="image/*,application/pdf"
            multiple
            maxFiles={4}
            maxFileSize={10 * 1024 * 1024}
            onError={(err) => {
              toast.error(
                err.code === "max_file_size"
                  ? "Attachments must be under 10 MB."
                  : err.code === "max_files"
                    ? "Up to 4 attachments per message."
                    : "Only images and PDFs are supported.",
              );
            }}
            onSubmit={(message: PromptInputMessage) => {
              send(message.text, message.files);
            }}
          >
            <PromptInputHeader>
              <AttachmentsRow />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask your strategist…"
                className="min-h-12"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <AttachButton />
              </PromptInputTools>
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
