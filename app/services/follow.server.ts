import type { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";

import { db } from "~/db/client";
import { follows } from "~/db/schema";

export const followInsertSchema = createInsertSchema(follows);

export type FollowEntryHandlerArgs = Pick<
  z.infer<typeof followInsertSchema>,
  "followedId" | "followerId"
>;

export async function followEntryHandler(datums: FollowEntryHandlerArgs) {
  const entry = await db.query.follows.findFirst({
    where: (follow, { eq, and }) =>
      and(
        eq(follow.followedId, datums.followedId),
        eq(follow.followerId, datums.followerId)
      ),
  });

  if (entry?.id) {
    await db.delete(follows).where(eq(follows.id, entry.id));
    return;
  }

  const result = await db.insert(follows).values(datums);

  const rowId = result.lastInsertRowid;
  if (rowId < 1 || typeof rowId !== "number") {
    throw Error("An error has occurred.");
  }

  return;
}
