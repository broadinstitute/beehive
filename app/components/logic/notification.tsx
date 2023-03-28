import {
  AlertTriangle,
  Github,
  LucideProps,
  Megaphone,
  Wand,
  X,
} from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

export type Notification =
  | GitHubActionsNotification
  | DevOpsAnnouncementNotification
  | ErrorNotification
  | NextStepsNotification;

interface AbstractNotification {
  type: string;
  text: string;
  url?: string;
  error?: boolean;
  clickVerb?: string;
}

export interface GitHubActionsNotification extends AbstractNotification {
  type: "gha";
  url: string;
}

export interface DevOpsAnnouncementNotification extends AbstractNotification {
  type: "announcement";
}

export interface ErrorNotification extends AbstractNotification {
  type: "error";
  error: true;
}

export interface NextStepsNotification extends AbstractNotification {
  type: "next-steps";
  error?: false;
}

export const NotificationComponent: React.FunctionComponent<{
  notification: Notification;
  close: () => void;
}> = ({ notification, close }) => {
  let Icon: (props: LucideProps) => ReactElement;
  let title: string;
  switch (notification.type) {
    case "gha":
      Icon = Github;
      title = "From GitHub";
      break;
    case "announcement":
      Icon = Megaphone;
      title = "From DevOps";
      break;
    case "error":
      Icon = AlertTriangle;
      title = "Error";
      break;
    case "next-steps":
      Icon = Wand;
      title = "Next Steps";
  }
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 400);
  }, []);
  return (
    <div
      className={`relative motion-safe:transition-all motion-safe:duration-1000 ease-out text-color-body-text ${
        visible ? "right-0" : "right-[-120vw] laptop:right-[-30vw]"
      }`}
    >
      <a
        className={`w-[80vw] laptop:w-[20vw] bg-color-nearest-bg flex flex-col rounded-2xl shadow-2xl drop-shadow-xl motion-safe:transition-all before:block before:absolute before:rounded-2xl before:border-2 ${
          notification.error
            ? "before:border-color-error-border before:border-dashed"
            : "before:border-color-neutral-hard-border"
        } before:w-full before:h-full before:motion-safe:transition-all ${
          notification.url
            ? "active:bg-color-button-down hover:drop-shadow-2xl before:hover:border-4"
            : ""
        }`}
        href={notification.url}
        target="_blank"
      >
        <div className="p-6 pt-6">
          <div className="flex flex-row space-x-2 mb-4">
            <Icon className="motion-safe:animate-bounce" />
            <span className="grow font-medium text-lg text-color-header-text">
              {title}
            </span>
          </div>
          {notification.text}
          {notification.url &&
            `, click to ${notification.clickVerb || "view"} ↗`}
        </div>
      </a>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(close, 1000);
        }}
        className="absolute right-5 top-5 p-1 hover:bg-color-icon-button-hover active:bg-color-icon-button-down rounded-full"
      >
        <X className="fill-color-header-text" />
      </button>
    </div>
  );
};

// This function exists because strongly-typing notifications is actually somewhat unintuitive.
// TypeScript doesn't have great JSX syntax for "I want to create an object matching this type";
// the `as` syntax is a type assertion that ignores checking on the object itself. Calling this
// function properly enforces the type of the notifications.
export function buildNotifications(
  ...notifications: Array<Notification>
): Array<Notification> {
  return notifications;
}
