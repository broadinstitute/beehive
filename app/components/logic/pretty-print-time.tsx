export interface PrettyPrintTimeProps {
  className?: string;
  time?: string;
}

export const PrettyPrintTime: React.FunctionComponent<PrettyPrintTimeProps> = ({
  className,
  time,
}) => (
  <span className={className}>
    {time ? new Date(time).toLocaleString() : "None"}
  </span>
);
