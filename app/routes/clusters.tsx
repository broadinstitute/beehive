import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";

export const handle = {
    breadcrumb: () => <NavLink to="/clusters">Clusters</NavLink>

}

const ClustersRoute: FunctionComponent = () =>
    <div>
    </div>

export default ClustersRoute
