import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { db } from "~/db/client";
import { threads } from "~/db/schema";
import { getFollowing } from "./follow.server";

export async function getFeedThreads(userId: number) {
  const ids = await getFollowing(userId);
  ids.push(userId);

  var date = new Date();
  date.setDate(date.getDate() - 5);

  return await db.query.threads.findMany({
    where: (thread, { and, inArray, gte }) =>
      and(inArray(thread.userId, ids), gte(thread.createdAt, date)),
    orderBy: (column, { desc }) => desc(column.createdAt),
    limit: 40,
    with: {
      user: true,
    },
  });
}

export const threadInsertSchema = createInsertSchema(threads);

type CreateNewThreadArgs = Pick<
  z.infer<typeof threadInsertSchema>,
  "body" | "userId"
>;

export async function createNewThread(data: CreateNewThreadArgs) {
  const parsed = threadInsertSchema.safeParse({
    ...data,
    createdAt: new Date(),
  });

  if (!parsed.success) {
    throw Error("An error has occurred.");
  }

  const result = await db.insert(threads).values(parsed.data);

  const rowId = result.lastInsertRowid;
  if (rowId < 1 || typeof rowId !== "number") {
    throw Error("An error has occurred.");
  }

  return;
}
