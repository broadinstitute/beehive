export interface PrettyPrintTimeProps {
  className?: string | undefined;
  time?: string | undefined;
}

export const PrettyPrintTime: React.FunctionComponent<PrettyPrintTimeProps> = ({
  className,
  time,
}) => (
  <span className={className}>
    {time ? new Date(time).toLocaleString() : "None"}
  </span>
);
