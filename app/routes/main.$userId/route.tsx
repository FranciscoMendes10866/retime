import { Suspense } from "react";
import { defer } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, Outlet, useLoaderData } from "@remix-run/react";
import { Spinner } from "@nextui-org/react";

import FollowRecomendations from "./FollowRecomendations";
import RecentActivity from "./RecentActivity";

import { getFollowRecomendations } from "~/services/follow.server";
import { getRecentActivity } from "~/services/notification.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = Number(params["userId"]);
  const recomendations = await getFollowRecomendations(userId);
  const recentActivityPromise = getRecentActivity(userId);
  return defer({ userId, recomendations, recentActivityPromise });
}

export default function Feed() {
  const { userId, recomendations, recentActivityPromise } =
    useLoaderData<typeof loader>();

  return (
    <section className="h-screen w-screen flex">
      <div className="w-4/12">
        <FollowRecomendations recomendations={recomendations} />
      </div>

      <div className="w-5/12 space-y-3 px-2">
        <Outlet />
      </div>

      <div className="w-4/12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-48">
              <Spinner size="sm" />
            </div>
          }
        >
          <Await resolve={recentActivityPromise}>
            <RecentActivity userId={userId} />
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
