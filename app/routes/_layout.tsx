import useResizeObserver from "@react-hook/resize-observer";
import { json, LoaderArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Header } from "~/components/layout/header";
import {
  Notification,
  NotificationComponent,
} from "~/components/logic/notification";
import { commitSession, getSession, sessionFields } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  // We can't use getValidSession here because this is a loader -- no form was
  // submitted, there's nothing to validate.
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
                  new Date().toISOString(),
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
        className="h-full overflow-x-auto snap-x snap-mandatory"
        ref={scrollControlRef}
      >
        <div className="min-w-min flex flex-row h-full grow" ref={scrolledRef}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default LayoutRoute;
