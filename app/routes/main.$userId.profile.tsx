import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  return json({ userId: params["userId"] });
}

export default function Profile() {
  const result = useLoaderData<typeof loader>();

  return <div>user &apos;{result.userId}&apos; profile</div>;
}
