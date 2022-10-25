export type Notification =
  | GitHubActionsNotification
  | DevOpsAnnouncementNotification;

interface AbstractNotification {
  type: string;
  text: string;
}

export interface GitHubActionsNotification extends AbstractNotification {
  type: "gha";
  url: string;
}

export interface DevOpsAnnouncementNotification extends AbstractNotification {
  type: "announcement";
  url?: string;
}

export const NotificationComponent: React.FunctionComponent<{
  notification: Notification;
  close: () => void;
}> = ({ notification, close }) => {
  switch (notification.type) {
    case "gha":
      return (
        <div className="w-[20vw] bg-white flex flex-row p-4 rounded-2xl drop-shadow-xl border-4 border-zinc-500 border-">
          <div className="grow">{notification.text}</div>
          <div>{notification.text}</div>
        </div>
      );
    case "announcement":
      return <div></div>;
  }
};

export const NotificationID = (notification: Notification): string => {
  switch (notification.type) {
    case "gha":
      return notification.url;
    case "announcement":
      return notification.text;
  }
};
