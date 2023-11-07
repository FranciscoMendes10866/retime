import { parse } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

import { createNewThread, getFeedThreads } from "~/services/thread.server";

const schema = z.object({
  body: z.string().min(6, "must have at least 6 chars long"),
});

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const result = await getFeedThreads(Number(params["userId"]));
    return json(result);
  } catch {
    // ...
  }
  return null;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  try {
    await createNewThread({
      userId: Number(params["userId"]),
      body: submission.value.body,
    });
  } catch {
    // ...
  }

  return null;
}

export default function Feed() {
  // const list = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>();

  const [form, fields] = useForm<z.infer<typeof schema>>({
    ...(lastSubmission ? { lastSubmission } : {}),
    shouldValidate: "onBlur",
  });

  const [isFollowed, setIsFollowed] = useState(false);

  return (
    <section className="h-screen w-screen flex">
      <span className="w-4/12" />
      <div className="w-5/12 space-y-3 px-2">
        <Form
          className="w-full pb-4 mt-6 flex flex-col space-y-3 border-b"
          method="POST"
          {...form.props}
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
          <Button color="primary" variant="light" fullWidth type="submit">
            Send Now
          </Button>
        </Form>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((elm, index) => (
          <Card
            className="w-full border-b"
            key={index}
            shadow="none"
            radius="none"
          >
            <CardHeader className="justify-between">
              <div className="flex gap-5">
                <Avatar isBordered radius="md" size="md" src="/dango.png" />
                <div className="flex flex-col gap-1 items-start justify-center">
                  <h4 className="text-small font-semibold leading-none text-default-600">
                    Zoey Lang
                  </h4>
                  <h5 className="text-small tracking-tight text-default-400">
                    @zoeylang
                  </h5>
                </div>
              </div>
              <Button
                className={
                  isFollowed
                    ? "bg-transparent text-foreground border-default-200"
                    : ""
                }
                color="primary"
                radius="full"
                size="sm"
                variant={isFollowed ? "bordered" : "solid"}
                onPress={() => setIsFollowed(!isFollowed)}
              >
                {isFollowed ? "Unfollow" : "Follow"}
              </Button>
            </CardHeader>
            <CardBody className="px-3 mb-6 text-small text-default-400">
              <p>
                Frontend developer and UI/UX enthusiast. Join me on this coding
                adventure!
              </p>
              <span className="pt-2">
                #FrontendWithZoey
                <span className="py-2" aria-label="computer" role="img">
                  💻
                </span>
              </span>
            </CardBody>
          </Card>
        ))}
      </div>
      <span className="w-4/12" />
    </section>
  );
}
