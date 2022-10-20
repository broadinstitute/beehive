import { useEffect, useState } from "react";

export interface PrettyPrintTimeProps {
  className?: string;
  time?: string;
}

export const PrettyPrintTime: React.FunctionComponent<PrettyPrintTimeProps> = ({
  className,
  time,
}) => {
  const [timeString, setTimeString] = useState("None");
  useEffect(
    () => setTimeString(time ? new Date(time).toLocaleString() : "None"),
    [time]
  );
  return <span className={className}>{timeString}</span>;
};
