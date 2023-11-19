import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params["userId"];
  if (!userId) return redirect("/account");
  return null;
}

export default function MainLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
