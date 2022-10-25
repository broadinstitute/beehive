import { Outlet, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";
import { Header } from "~/components/layout/header";
import { json, LoaderFunction } from "@remix-run/node";
import { commitSession, getSession, sessionFields } from "~/session.server";
import {
  Notification,
  NotificationComponent,
  NotificationID as notificationID,
} from "~/components/logic/notification";
import { useState } from "react";
import { useEffect } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const notificationToFlash =
    session.get(sessionFields.flashNotification) || null;
  if (notificationToFlash) {
    return json<Notification | null>(
      JSON.parse(notificationToFlash) as Notification,
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    return json<Notification | null>(null);
  }
};

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

  const notificationToFlash = useLoaderData<Notification | null>();
  const [notifications, setNotifications] = useState(
    new Map<string, Notification>([
      // ["foo", { type: "gha", text: "foo", url: "https://example.com" }],
    ])
  );
  useEffect(() => {
    if (notificationToFlash !== null) {
      setNotifications((previous) => {
        previous.set(notificationID(notificationToFlash), notificationToFlash);
        return previous;
      });
    }
  }, [notificationToFlash]);

  return (
    <>
      <Header />
      <div className="absolute right-10 bottom-10 z-50">
        {Array.from(notifications.entries()).map(([key, notification]) => (
          <NotificationComponent
            key={key}
            notification={notification}
            close={() => {
              setNotifications((previous) => {
                previous.delete(key);
                return previous;
              });
            }}
          />
        ))}
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
