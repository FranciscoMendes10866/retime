import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params["userId"];
  const threadId = params["threadId"];
  if (!threadId) return redirect(`/main/${userId}`);
  return null;
}

export default function ThreadLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
