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
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { z } from "zod";

import { createNewThread, getFeedThreads } from "~/services/thread.server";

const schema = z.object({
  body: z.string().min(6, "must have at least 6 chars long"),
});

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const userId = Number(params["userId"]);

    const result = await getFeedThreads(userId);
    return json({ userId, list: result });
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
  const result = useLoaderData<typeof loader>();
  const lastSubmission = useActionData<typeof action>();
  const submit = useSubmit();

  const [form, fields] = useForm<z.infer<typeof schema>>({
    ...(lastSubmission ? { lastSubmission } : {}),
    shouldValidate: "onBlur",
  });

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
        {result?.list?.map((item, index) => (
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
                    {item.user.username}
                  </h4>
                  <h5 className="text-small tracking-tight text-default-400">
                    @{item.user.username.toLowerCase()}
                  </h5>
                </div>
              </div>
              <Button
                className={
                  true
                    ? "bg-transparent text-foreground border-default-200"
                    : ""
                }
                color="primary"
                radius="full"
                size="sm"
                variant={true ? "bordered" : "solid"}
                onClick={(evt) => {
                  evt.stopPropagation();
                  const formData = new FormData();
                  formData.append("followerId", result.userId.toString());
                  formData.append("followedId", item.id.toString());
                  submit(formData, {
                    method: "POST",
                    action: "/api/follow",
                    replace: false,
                  });
                }}
              >
                {true ? "Unfollow" : "Follow"}
              </Button>
            </CardHeader>
            <CardBody className="px-3 mb-6 text-small text-default-400">
              <p>{item.body}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <span className="w-4/12" />
    </section>
  );
}
