import { Avatar, Card, CardBody, CardHeader } from "@nextui-org/react";
import type { ReactNode } from "react";

interface Props {
  username: string;
  body: string;
  action: ReactNode;
}

export default function ThreadItem({ username, body, action }: Props) {
  return (
    <Card className="w-full border-b" shadow="none" radius="none">
      <CardHeader className="justify-between">
        <div className="flex w-full justify-between">
          <div className="flex space-x-4">
            <Avatar isBordered radius="md" size="md" src="/dango.png" />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600">
                {username}
              </h4>
              <h5 className="text-small tracking-tight text-default-400">
                @{username.toLowerCase()}
              </h5>
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardBody className="px-3 mb-6 text-small text-default-400">
        <p>{body}</p>
      </CardBody>
    </Card>
  );
}
