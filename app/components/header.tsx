import { NavLink, useMatches } from "@remix-run/react";
import { FunctionComponent } from "react";
import Favicon from "./assets/favicon";

export const Header: FunctionComponent = () => {
    const matches = useMatches();
    return (
        <div className="h-14 bg-white flex space-x-2 shadow-md shrink-0">
            <NavLink to="/" className="flex items-center space-x-2 ml-2">
                <Favicon className="h-9 w-9" />
                <span className="font-medium text-3xl pb-1 px-1">Beehive</span>
            </NavLink>
            {matches
                .filter(match => match.handle?.breadcrumb)
                .map((match, index) =>
                    <div key={index.toString()} className="flex items-center space-x-2 font-light text-xl">
                        <span>❯</span>
                        {match.handle!.breadcrumb(/* match.data // https://github.com/remix-run/remix/discussions/2672; uncomment to pass RouteData to breadcrumb function*/)}
                    </div>)
            }
        </div>
    )
}

export default Header
