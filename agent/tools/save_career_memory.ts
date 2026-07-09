import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";
import {
  MEMORY_CATEGORY_TO_PRISMA,
  memoryCategories,
} from "./retrieve_career_memories";

export default defineTool({
  description:
    "Save (or update) a durable career memory: a fact, preference, constraint, or rule worth remembering across conversations. Confirm with the user before saving unless they explicitly asked you to remember it. Reusing an existing key updates that memory.",
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .max(100)
      .describe("Short kebab-case identifier, e.g. 'salary-floor' or 'no-relocation'."),
    value: z.string().min(1).describe("The memory content, one clear statement."),
    category: z.enum(memoryCategories),
    confidence: z
      .enum(["high", "medium", "low"])
      .default("high")
      .describe("How certain this memory is. 'high' only when the user stated it directly."),
  }),
  async execute({ key, value, category, confidence }) {
    const user = await getUser();
    const memory = await prisma.careerMemory.upsert({
      where: { userId_key: { userId: user.id, key } },
      update: {
        value,
        category: MEMORY_CATEGORY_TO_PRISMA[category],
        confidence,
      },
      create: {
        userId: user.id,
        key,
        value,
        category: MEMORY_CATEGORY_TO_PRISMA[category],
        confidence,
        source: "strategist chat",
      },
    });
    return { saved: true, key: memory.key, viewAt: "/memories" };
  },
});
