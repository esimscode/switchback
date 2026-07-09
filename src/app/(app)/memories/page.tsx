import Link from "next/link";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MemoryCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { MEMORY_CATEGORY_LABELS } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { DeleteMemoryButton, MemoryDialog } from "./memory-dialog";

export const metadata = { title: "Memories" };
export const dynamic = "force-dynamic";

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory =
    category && category in MEMORY_CATEGORY_LABELS
      ? (category as MemoryCategory)
      : undefined;

  const user = await getUser();
  const memories = await prisma.careerMemory.findMany({
    where: { userId: user.id, ...(activeCategory && { category: activeCategory }) },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Memories"
        description="What the strategist remembers about you — inspect, correct, delete."
        actions={<MemoryDialog />}
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <Button asChild size="xs" variant={activeCategory ? "outline" : "secondary"}>
            <Link href="/memories">All</Link>
          </Button>
          {Object.entries(MEMORY_CATEGORY_LABELS).map(([value, label]) => (
            <Button
              key={value}
              asChild
              size="xs"
              variant={activeCategory === value ? "secondary" : "outline"}
            >
              <Link href={`/memories?category=${value}`}>{label}</Link>
            </Button>
          ))}
        </div>

        {memories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <BookOpen className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No memories in this view</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tell the strategist to remember something, or add one manually.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {memories.map((memory) => (
              <Card key={memory.id} size="sm">
                <CardContent className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="eyebrow text-muted-foreground">
                        {memory.key}
                      </span>
                      <Badge variant="secondary">
                        {MEMORY_CATEGORY_LABELS[memory.category]}
                      </Badge>
                      {memory.confidence && memory.confidence !== "high" ? (
                        <Badge variant="outline">{memory.confidence} confidence</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm">{memory.value}</p>
                  </div>
                  <div className="flex items-center">
                    <MemoryDialog
                      memory={{
                        id: memory.id,
                        key: memory.key,
                        value: memory.value,
                        category: memory.category,
                      }}
                    />
                    <DeleteMemoryButton memoryId={memory.id} memoryKey={memory.key} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
