import type { ActionFunctionArgs } from "@remix-run/node";

import { pusherServer } from "~/utils/pusher.server";

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.text();

  const [socketId, channelName] = data
    .split("&")
    .map((str) => str.split("=")[1]);

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);

  return new Response(JSON.stringify(authResponse), { status: 200 });
}
