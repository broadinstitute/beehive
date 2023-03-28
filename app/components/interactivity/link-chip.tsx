import { Link } from "@remix-run/react";
import { ReactNode } from "react";

export const LinkChip: React.FunctionComponent<{
  text: ReactNode;
  to: string;
  backgroundClassName: string;
  borderClassName: string;
  arrow?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
}> = ({ text, to, backgroundClassName, borderClassName, arrow, target }) => (
  <Link
    to={to}
    target={target}
    prefetch="intent"
    className={`shrink-0 border rounded-xl hover:shadow-md motion-safe:transition-all px-2 ${backgroundClassName} ${borderClassName} flex flex-row h-8 items-center`}
  >
    <h2 className="text-xl font-light">
      {text}
      {arrow && " ↗"}
    </h2>
  </Link>
);
