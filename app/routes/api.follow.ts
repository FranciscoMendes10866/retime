import { type ActionFunctionArgs } from "@remix-run/node";

import {
  followEntryHandler,
  followInsertSchema,
} from "~/services/follow.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const map: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    map[key] = Number(value);
  }

  const datums = await followInsertSchema.parseAsync(map);

  await followEntryHandler(datums);

  return new Response("OK", { status: 200 });
}
