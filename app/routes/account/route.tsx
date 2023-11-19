import { json, redirect } from "@remix-run/node";
import { type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { Button, Input } from "@nextui-org/react";

import { createAccount } from "./account-service.server";

export const meta: MetaFunction = () => [
  { title: "retime" },
  { name: "description", content: "Join the group!" },
];

const schema = z.object({
  username: z.string().min(3, "must have at least 3 chars long"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  try {
    const userId = await createAccount(submission.value.username);
    return redirect(`/main/${userId}`);
  } catch (cause) {
    if (cause instanceof Error) {
      submission.error.username = [cause.message];
    }
    return json(submission);
  }
}

export default function Index() {
  const lastSubmission = useActionData<typeof action>();

  const [form, fields] = useForm<z.infer<typeof schema>>({
    lastSubmission,
    shouldValidate: "onBlur",
  });

  return (
    <section className="flex items-center justify-center h-screen w-full">
      <Form
        className="flex w-72 flex-col space-y-4"
        method="POST"
        {...form.props}
      >
        <Input
          type="text"
          label="Username"
          variant="bordered"
          name="username"
          isInvalid={!!fields.username.error}
          defaultValue={fields.username.defaultValue}
          errorMessage={fields.username.error}
        />
        <Button color="primary" variant="shadow" type="submit">
          Join
        </Button>
      </Form>
    </section>
  );
}
