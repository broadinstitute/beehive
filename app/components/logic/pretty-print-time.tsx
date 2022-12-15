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
    () => setTimeString(time ? new Date(time).toLocaleString() : "None"),
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
