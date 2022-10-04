import { LoaderFunction } from "@remix-run/node";
import { NavLink, Params, useLoaderData, useParams } from "@remix-run/react";
import {
  AppVersionsApi,
  V2controllersAppVersion,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { AppVersionColors } from "~/components/content/app-version/app-version-colors";
import { AppVersionDetails } from "~/components/content/app-version/app-version-details";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Leaf } from "~/components/route-tree/leaf";
import {
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/app-versions/${params.appVersion}`}
    >
      {params.appVersion}
    </NavLink>
  ),
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new AppVersionsApi(SherlockConfiguration)
    .apiV2AppVersionsSelectorGet(
      { selector: `${params.chartName}/${params.appVersion}` },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const AppVersionRoute: React.FunctionComponent = () => {
  const appVersion = useLoaderData<V2controllersAppVersion>();
  return (
    <Leaf>
      <OutsetPanel {...AppVersionColors}>
        <ItemDetails
          subtitle={`App Version of ${appVersion.chart}`}
          title={appVersion.appVersion || ""}
        >
          <AppVersionDetails appVersion={appVersion} />
        </ItemDetails>
      </OutsetPanel>
    </Leaf>
  );
};

export default AppVersionRoute;
