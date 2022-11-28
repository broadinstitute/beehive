import { NavLink, useMatches, useParams } from "@remix-run/react";
import { FunctionComponent } from "react";
import { BeehiveIcon } from "../assets/beehive-icon";

export const Header: FunctionComponent = () => {
  const matches = useMatches();
  const params = useParams();
  return (
    <div className="h-14 bg-color-nearest-bg text-color-header-text flex space-x-2 shadow-md shrink-0 z-20">
      <NavLink to="/" className="flex items-center space-x-2 ml-2">
        <BeehiveIcon className="h-9 w-9" />
        <span className="font-medium text-3xl pb-1 px-1">Beehive</span>
      </NavLink>
      {matches
        .filter((match) => match.handle?.breadcrumb)
        .map((match, index) => (
          <div
            key={index.toString()}
            className="flex items-center space-x-2 font-light text-xl"
          >
            <span>❯</span>
            {match.handle!.breadcrumb(params)}
          </div>
        ))}
    </div>
  );
};
