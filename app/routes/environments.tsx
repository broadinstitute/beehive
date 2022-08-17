import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";

export const handle = {
    breadcrumb: () => <NavLink to="/environments">Environments</NavLink>

}

const EnvironmentsRoute: FunctionComponent = () =>
    <div>
    </div>

export default EnvironmentsRoute
