import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Textarea,
} from "@nextui-org/react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  return json({ userId: params["userId"] });
}

export default function Feed() {
  const result = useLoaderData<typeof loader>();
  const [isFollowed, setIsFollowed] = useState(false);

  return (
    <section className="h-screen w-screen flex">
      <span className="w-4/12" />
      <div className="w-5/12 space-y-3 px-2">
        <div className="w-full pb-4 mt-6 flex flex-col space-y-3 border-b">
          <Textarea
            label="Thread"
            placeholder="Type here anything that comes to your mind..."
            variant="bordered"
            color="primary"
          />
          <Button color="primary" variant="light" fullWidth isDisabled>
            Send Now
          </Button>
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((elm, index) => (
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
                    Zoey Lang
                  </h4>
                  <h5 className="text-small tracking-tight text-default-400">
                    @zoeylang
                  </h5>
                </div>
              </div>
              <Button
                className={
                  isFollowed
                    ? "bg-transparent text-foreground border-default-200"
                    : ""
                }
                color="primary"
                radius="full"
                size="sm"
                variant={isFollowed ? "bordered" : "solid"}
                onPress={() => setIsFollowed(!isFollowed)}
              >
                {isFollowed ? "Unfollow" : "Follow"}
              </Button>
            </CardHeader>
            <CardBody className="px-3 mb-6 text-small text-default-400">
              <p>
                Frontend developer and UI/UX enthusiast. Join me on this coding
                adventure!
              </p>
              <span className="pt-2">
                #FrontendWithZoey
                <span className="py-2" aria-label="computer" role="img">
                  💻
                </span>
              </span>
            </CardBody>
          </Card>
        ))}
      </div>
      <span className="w-4/12" />
    </section>
  );
}
