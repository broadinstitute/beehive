import { Link } from "@remix-run/react";

export const LinkChip: React.FunctionComponent<{
  text: string;
  to: string;
  backgroundClassName: string;
  borderClassName: string;
}> = ({ text, to, backgroundClassName, borderClassName }) => (
  <Link
    to={to}
    prefetch="intent"
    className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all px-2 ${backgroundClassName} ${borderClassName} flex flex-row h-8 items-center`}
  >
    <h2 className="text-xl font-light">{text}</h2>
  </Link>
);
