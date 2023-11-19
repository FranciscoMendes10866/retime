import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { ArrowUpRight } from "lucide-react";
import { Button, Textarea, Tooltip } from "@nextui-org/react";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { json } from "@remix-run/node";
import { z } from "zod";

import ThreadItem from "~/components/ThreadItem";

import { createNewThread, getFeedThreads } from "~/services/thread.server";

const schema = z.object({
  body: z.string().min(2, "must have at least 2 chars"),
});

type FormValues = z.infer<typeof schema>;

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = Number(params["userId"]);
  const threads = await getFeedThreads(userId);
  return json({ userId, threads });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  await createNewThread({
    userId: Number(params["userId"]),
    body: submission.value.body,
  });

  submission.value.body = "";
  return json(submission);
}

export default function Page() {
  const { threads, userId } = useLoaderData<typeof loader>();
  const lastSubmission = useActionData<typeof action>();

  const [formProps, fields] = useForm<FormValues>({
    ...(lastSubmission ? { lastSubmission } : {}),
    shouldValidate: "onBlur",
  });

  return (
    <>
      <Form
        className="w-full pb-4 mt-6 flex flex-col space-y-3 border-b"
        method="POST"
        {...formProps}
      >
        <Textarea
          name="body"
          label="Thread"
          placeholder="Type here anything that comes to your mind..."
          variant="bordered"
          color="primary"
          isInvalid={!!fields.body.error}
          defaultValue={fields.body.defaultValue}
          errorMessage={fields.body.error}
        />
        <Button color="primary" variant="ghost" fullWidth type="submit">
          Send Now
        </Button>
      </Form>

      {threads.map((thread) => (
        <ThreadItem
          key={thread.id}
          username={thread.user.username}
          body={thread.body}
          action={
            <Tooltip content="See topic in detail">
              <Button
                isIconOnly
                color="primary"
                variant="light"
                as={Link}
                to={`/main/${userId}/thread/${thread.id}`}
              >
                <ArrowUpRight size={16} />
              </Button>
            </Tooltip>
          }
        />
      ))}
    </>
  );
}
