import { useEffect, useState } from "react";

export interface PrettyPrintTimeProps {
  className?: string;
  time?: string | Date;
}

export const PrettyPrintTime: React.FunctionComponent<PrettyPrintTimeProps> = ({
  className,
  time,
}) => {
  const [timeString, setTimeString] = useState(
    time ? new Date(time).toISOString() : "None"
  );
  useEffect(
    () =>
      setTimeString(
        (time ? new Date(time).toLocaleString() : "None") +
          " (local time), " +
          timeSinceFunc(time) +
          " ago"
      ),
    [time]
  );
  return (
    <span
      title={time ? new Date(time).toISOString() : undefined}
      className={className}
    >
      {timeString}
    </span>
  );
};

var timeSinceFunc = function (date: string | Date | undefined) {
  if (date == undefined) return "None";
  if (typeof date !== "object") {
    date = new Date(date);
  }

  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  var intervalType;

  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = "year";
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = "month";
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = "day";
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = "hour";
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = "minute";
          } else {
            interval = seconds;
            intervalType = "second";
          }
        }
      }
    }
  }

  if (interval > 1 || interval === 0) {
    intervalType += "s";
  }

  return interval + " " + intervalType;
};
