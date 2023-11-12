import { Suspense } from "react";
import { parse } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { Button, Spinner, Textarea } from "@nextui-org/react";
import { defer, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Await, Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

import ThreadItem from "~/components/ThreadItem";
import FollowRecomendations from "~/components/FollowRecomendations";

import { createNewThread, getFeedThreads } from "~/services/thread.server";
import { getFollowRecomendations } from "~/services/follow.server";

const schema = z.object({
  body: z.string().min(6, "must have at least 6 chars long"),
});

type FormValues = z.infer<typeof schema>;

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = Number(params["userId"]);

  const recomendationsPromise = getFollowRecomendations(userId);
  const threads = await getFeedThreads(userId);

  return defer({ userId, threads, recomendationsPromise });
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

export default function Feed() {
  const { recomendationsPromise, threads } = useLoaderData<typeof loader>();
  const lastSubmission = useActionData<typeof action>();

  const [formProps, fields] = useForm<FormValues>({
    ...(lastSubmission ? { lastSubmission } : {}),
    shouldValidate: "onBlur",
  });

  return (
    <section className="h-screen w-screen flex">
      <div className="w-4/12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full w-full">
              <Spinner size="sm" />
            </div>
          }
        >
          <Await resolve={recomendationsPromise}>
            {(recomendations) => (
              <FollowRecomendations recomendations={recomendations} />
            )}
          </Await>
        </Suspense>
      </div>

      <div className="w-5/12 space-y-3 px-2">
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

        {threads.map((item) => (
          <ThreadItem
            key={item.id}
            username={item.user.username}
            body={item.body}
          />
        ))}
      </div>

      <span className="w-4/12" />
    </section>
  );
}
