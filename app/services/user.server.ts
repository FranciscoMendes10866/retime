import { db } from "~/db/client";
import { users } from "~/db/schema";

export async function createAccount(username: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user?.id) {
    const result = await db.insert(users).values({ username });
    const rowId = result.lastInsertRowid;
    if (rowId < 1 || typeof rowId !== "number") {
      throw Error("An error has occurred.");
    }
    return rowId;
  }

  return user.id;
}
