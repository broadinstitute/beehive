import { Outlet, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { Header } from "~/components/layout/header";
import { json, LoaderArgs } from "@remix-run/node";
import { commitSession, getSession, sessionFields } from "~/session.server";
import {
  Notification,
  NotificationComponent,
  NotificationID as notificationID,
} from "~/components/logic/notification";
import { useState } from "react";
import { useEffect } from "react";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const notificationsToFlash: Array<Notification> | null =
    session.get(sessionFields.flashNotifications) || null;
  if (notificationsToFlash) {
    return json(notificationsToFlash, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    return json(null);
  }
}

// Extracted so the LoadScroller can reference it
export const scrollDivID: string = "scroll-control";

const LayoutRoute: React.FunctionComponent = () => {
  const scrollControlRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef<HTMLDivElement>(null);
  useResizeObserver(scrolledRef, (entry) => {
    scrollControlRef.current?.scrollTo({
      behavior: "smooth",
      left: entry.contentBoxSize[0].inlineSize,
    });
  });

  const notificationsToFlash = useLoaderData<typeof loader>();
  const [notifications, setNotifications] = useState(
    new Map<string, null | Notification>()
  );
  useEffect(() => {
    if (notificationsToFlash !== null) {
      setNotifications(
        (previous) =>
          new Map([
            ...previous,
            ...Array.from(
              notificationsToFlash.map(
                (notification): [string, Notification] => [
                  notificationID(notification),
                  notification,
                ]
              )
            ),
          ])
      );
    }
  }, [notificationsToFlash]);

  return (
    <>
      <Header />
      <div className="absolute right-10 bottom-10 z-50 flex flex-col space-y-6">
        {Array.from(notifications.entries()).map(
          ([key, notification]) =>
            notification && (
              <NotificationComponent
                key={key}
                notification={notification}
                close={() => {
                  setNotifications(
                    (previous) => new Map([...previous, [key, null]])
                  );
                }}
              />
            )
        )}
      </div>
      <div
        id={scrollDivID}
        className="h-full overflow-x-auto"
        ref={scrollControlRef}
      >
        <div className="h-full min-w-min" ref={scrolledRef}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default LayoutRoute;
