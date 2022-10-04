import { LoaderFunction } from "@remix-run/node";
import {
  useParams,
  NavLink,
  useLoaderData,
  Outlet,
  Params,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import { toTitleCase } from "~/helpers/strings";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { EnvironmentDetails } from "~/components/content/environment/environment-details";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}`}>
      {params.environmentName}
    </NavLink>
  ),
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorGet(
      { selector: params.environmentName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentNameRoute: React.FunctionComponent = () => {
  const environment = useLoaderData<V2controllersEnvironment>();
  return (
    <Branch>
      <OutsetPanel {...EnvironmentColors}>
        <ItemDetails
          subtitle={`${
            environment.lifecycle == "template" ? "BEE " : ""
          }${toTitleCase(environment.lifecycle || "")}${
            environment.lifecycle == "dynamic" ? " BEE" : " "
          } environment`}
          title={environment.name || ""}
        >
          <EnvironmentDetails
            environment={environment}
            toChartReleases="./chart-releases"
            toEdit="./edit"
            toDelete={environment.lifecycle != "static" ? "./delete" : ""}
          />
        </ItemDetails>
      </OutsetPanel>
      <Outlet context={{ environment }} />
    </Branch>
  );
};

export default EnvironmentNameRoute;
