import { Button, Input, Tooltip } from "@nextui-org/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

import ThreadItem from "~/components/ThreadItem";

import { getThreadById } from "~/services/thread.server";
import { createReply, replyInsertSchema } from "~/services/comment.server";
import { createCommentNotification } from "~/services/notification.server";
import { timeAgo } from "~/utils/timeAgo";

export async function loader({ params }: LoaderFunctionArgs) {
  const threadId = Number(params["threadId"]);
  const userId = Number(params["userId"]);
  const thread = await getThreadById(threadId);
  return json({ thread, userId, threadId });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const map: Record<string, number | string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "body") {
      map[key] = value.toString();
      continue;
    }
    map[key] = Number(value);
  }

  const { threadAuthorId, ...rest } = map;

  const datums = await replyInsertSchema.parseAsync({
    ...rest,
    createdAt: new Date(),
  });

  await createReply(datums);

  if (typeof threadAuthorId === "number") {
    await createCommentNotification({
      actorId: threadAuthorId,
      threadId: datums.threadId,
    });
  }

  return new Response("OK", { status: 200 });
}

export default function Page() {
  const { thread, userId, threadId } = useLoaderData<typeof loader>();

  return (
    <div className="mt-6 space-y-4">
      <ThreadItem
        username={thread?.user.username ?? ""}
        body={thread?.body ?? ""}
        action={
          <Tooltip content="Go back">
            <Button
              isIconOnly
              color="primary"
              variant="light"
              as={Link}
              to={`/main/${userId}`}
            >
              <ArrowLeft size={16} />
            </Button>
          </Tooltip>
        }
      />

      <Form method="POST">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="threadAuthorId" value={thread?.user.id} />
        <Input
          name="body"
          placeholder="Leave a comment here..."
          variant="bordered"
        />
        <input type="submit" hidden />
      </Form>

      <div className="space-y-2">
        {thread?.replies.map((reply) => (
          <div
            key={`reply-#${reply.id}`}
            className="py-4 border-b border-b-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 text-sm">
                @{reply.user.username.toLowerCase()}
              </p>
              <h3 className="text-gray-800 text-sm">{reply.body}</h3>
            </div>
            <time className="text-sm text-gray-600">
              {timeAgo(reply.createdAt)}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
