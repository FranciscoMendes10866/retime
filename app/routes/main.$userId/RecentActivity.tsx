import { Link as Anchor } from "@nextui-org/react";
import { Link, useAsyncValue } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";

import type {
  NotificationNamespace,
  Notification,
} from "~/services/notification.server";
import { pusherClient } from "~/utils/pusher-client";
import { timeAgo } from "~/utils/timeAgo";

interface Props {
  userId: number;
}

export default function RecentActivity({ userId }: Props) {
  const initialRecentActivity = useAsyncValue() as Array<Notification>;

  const [items, setItems] = useState<Array<Notification>>(() => [
    ...initialRecentActivity,
  ]);

  useEffect(() => {
    const channel = pusherClient
      .subscribe(userId.toString())
      .bind("notify-evt", (datum: Notification) => {
        setItems((currentState) => {
          const clone = structuredClone(currentState);
          clone.unshift(datum);
          return clone;
        });
      });

    return () => {
      channel.unbind();
    };
  }, [userId]);

  return (
    <div className="flex flex-col mt-3">
      <h3 className="text-gray-400 text-sm leading-loose mx-6 my-2">
        Recent Activity
      </h3>
      <div className="mx-6 px-2 border-2 border-dashed border-gray-200 rounded-xl max-h-86 overflow-y-auto">
        <div className="flex flex-col py-2 space-y-2">
          {items.map((activity) => (
            <ActivityItem
              key={`activity-#${activity.id}`}
              activity={activity}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ItemProps {
  activity: Notification;
  userId: number;
}

function ActivityItem({ activity, userId }: ItemProps) {
  const datum = useMemo(() => {
    try {
      return JSON.parse(activity.namespace) as NotificationNamespace;
    } catch {
      return undefined;
    }
  }, [activity]);

  return (
    <span className="flex items-center justify-between px-2 text-md text-gray-600">
      <p>
        People commented on your&nbsp;
        <Anchor to={`/main/${userId}/thread/${datum?.subjectId}`} as={Link}>
          post
        </Anchor>
        .
      </p>

      {typeof activity.createdAt === "string" ? (
        <time className="text-xs">{timeAgo(activity.createdAt)}</time>
      ) : null}
    </span>
  );
}
