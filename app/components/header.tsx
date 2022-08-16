import { NavLink, useMatches } from "@remix-run/react";
import Favicon from "./favicon";

export default function Header() {
    const matches = useMatches();
    return (
        <div className="h-14 bg-white text-2xl flex space-x-2 shadow-md">
            <NavLink to="/" className="flex items-center space-x-2 ml-2">
                <Favicon className="h-9 w-9" />
                <span className="font-semibold">Beehive</span>
            </NavLink>
            {matches
                .filter(match => match.handle?.breadcrumb)
                .map((match, index) =>
                    <div key={index.toString()} className="flex items-center space-x-2">
                        <span>❯</span>
                        {match.handle!.breadcrumb(/* match.data // https://github.com/remix-run/remix/discussions/2672; uncomment to pass RouteData to breadcrumb function*/)}
                    </div>)
            }
        </div>
    )
}