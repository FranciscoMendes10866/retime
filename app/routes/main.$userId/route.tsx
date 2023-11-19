import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import FollowRecomendations from "./FollowRecomendations";

import { getFollowRecomendations } from "~/services/follow.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = Number(params["userId"]);
  const recomendations = await getFollowRecomendations(userId);
  return json({ recomendations });
}

export default function Feed() {
  const { recomendations } = useLoaderData<typeof loader>();

  return (
    <section className="h-screen w-screen flex">
      <div className="w-4/12">
        <FollowRecomendations recomendations={recomendations} />
      </div>

      <div className="w-5/12 space-y-3 px-2">
        <Outlet />
      </div>

      <span className="w-4/12" />
    </section>
  );
}
