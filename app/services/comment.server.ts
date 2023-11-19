import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { db } from "~/db/client";
import { replies } from "~/db/schema";

export const replyInsertSchema = createInsertSchema(replies);

export type Reply = z.infer<typeof replyInsertSchema>;

export async function createReply(datums: Reply) {
  const replyResult = await db.insert(replies).values(datums);
  return replyResult.lastInsertRowid;
}
