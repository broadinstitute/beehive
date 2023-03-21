import { NavLink, useMatches, useParams } from "@remix-run/react";
import { FunctionComponent } from "react";
import { BeehiveIcon } from "../assets/beehive-icon";

export const Header: FunctionComponent = () => {
  const breadcrumbs = useMatches().filter((match) => match.handle?.breadcrumb);
  const params = useParams();
  return (
    <div className="h-14 bg-color-nearest-bg text-color-header-text flex gap-2 shadow-md shrink-0 z-20">
      <NavLink to="/" className="flex items-center gap-2 ml-2">
        <BeehiveIcon className="h-9 w-9" />
        <span className="hidden laptop:block font-medium text-3xl laptop:pb-1 px-1">
          Beehive
        </span>
      </NavLink>
      <div className="flex items-center gap-2 overflow-x-auto pr-2">
        {breadcrumbs.map((match, index) => (
          <div
            key={index.toString()}
            className="shrink-0 items-center gap-2 font-light text-xl laptop:flex last:flex hidden"
          >
            <span>❯</span>
            {match.handle?.breadcrumb(params)}
          </div>
        ))}
      </div>
    </div>
  );
};
