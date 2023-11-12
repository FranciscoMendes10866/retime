import { Avatar, Button } from "@nextui-org/react";
import { useFetcher, useParams } from "@remix-run/react";

import type { User } from "~/services/user.server";

interface Props {
  recomendations?: Array<User>;
}

export default function FollowRecomendations({ recomendations }: Props) {
  return (
    <div className="flex flex-col mt-3">
      <h3 className="text-gray-400 text-sm leading-loose mx-6 my-2">
        Suggested
      </h3>
      <div className="mx-6 px-2 border-2 border-dashed border-gray-200 rounded-xl max-h-86 overflow-y-auto">
        <div className="flex flex-col py-2 space-y-2">
          {recomendations?.map((item) => (
            <RecomendationItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RecomendationItemProps {
  item: User;
}

function RecomendationItem({ item }: RecomendationItemProps) {
  const { userId = "" } = useParams();
  const fetcher = useFetcher();

  return (
    <div className="flex justify-between p-2">
      <div className="flex gap-5">
        <Avatar isBordered radius="md" size="md" src="/dango.png" />
        <div className="flex flex-col gap-1 items-start justify-center">
          <h4 className="text-small font-semibold leading-none text-default-600">
            {item.username}
          </h4>
          <h5 className="text-small tracking-tight text-default-400">
            @{item.username.toLowerCase()}
          </h5>
        </div>
      </div>
      <input type="hidden" name="userId" value={item.id} />
      <Button
        color="primary"
        radius="full"
        size="sm"
        variant="solid"
        onClick={async (evt) => {
          evt.stopPropagation();
          const formData = new FormData();
          formData.append("followedId", item.id!.toString());
          formData.append("followerId", userId);
          fetcher.submit(formData, {
            method: "POST",
            action: "/api/follow",
          });
        }}
      >
        Follow
      </Button>
    </div>
  );
}
