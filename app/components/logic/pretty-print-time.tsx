import { useEffect, useState } from "react";

export interface PrettyPrintTimeProps {
  className?: string;
  time?: string | Date | null;
}

export const PrettyPrintTime: React.FunctionComponent<PrettyPrintTimeProps> = ({
  className,
  time,
}) => {
  const [timeString, setTimeString] = useState(
    time ? new Date(time).toISOString() : "None",
  );
  useEffect(
    () => setTimeString(time ? dateToPrettyString(time) : "None"),
    [time],
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

var dateToPrettyString = function (date: string | Date) {
  if (typeof date !== "object") {
    date = new Date(date);
  }

  let secondsAgo = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let absoluteSecondsAgo = Math.abs(secondsAgo);
  let intervalType;

  let interval = Math.floor(absoluteSecondsAgo / 31536000);
  if (interval >= 1) {
    intervalType = "year";
  } else {
    interval = Math.floor(absoluteSecondsAgo / 2592000);
    if (interval >= 1) {
      intervalType = "month";
    } else {
      interval = Math.floor(absoluteSecondsAgo / 86400);
      if (interval >= 1) {
        intervalType = "day";
      } else {
        interval = Math.floor(absoluteSecondsAgo / 3600);
        if (interval >= 1) {
          intervalType = "hour";
        } else {
          interval = Math.floor(absoluteSecondsAgo / 60);
          if (interval >= 1) {
            intervalType = "minute";
          } else {
            interval = absoluteSecondsAgo;
            intervalType = "second";
          }
        }
      }
    }
  }

  if (interval > 1 || interval === 0) {
    intervalType += "s";
  }
  return `${date.toLocaleString()}, ${interval} ${intervalType} ${
    secondsAgo > 0 ? "ago" : "from now"
  }`;
};
