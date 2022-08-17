import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";

export const handle = {
    breadcrumb: () => <NavLink to="/chart-releases">Chart Releases</NavLink>

}

const ChartReleasesRoute: FunctionComponent = () =>
    <div>
    </div>

export default ChartReleasesRoute
