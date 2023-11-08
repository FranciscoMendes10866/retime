import type { ActionFunctionArgs } from "@remix-run/node";

import {
  followEntryHandler,
  followInsertSchema,
} from "~/services/follow.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    const datums = await followInsertSchema.parseAsync(
      Object.fromEntries(formData)
    );

    await followEntryHandler(datums);
  } catch {
    // ...
  }
}
