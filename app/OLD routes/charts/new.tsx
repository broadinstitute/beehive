import { ActionFunction, redirect } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { verifyAuthenticityToken } from "remix-utils";
import NewPanel from "~/components/OLD panels/new";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import {
  ChartCreatableFields,
  ChartEditableFields,
} from "~/components/OLD sherlock/chart";
import {
  SherlockConfiguration,
  forwardIAP,
  errorResponseThrower,
  formDataToObject,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => <NavLink to="/charts/new">New</NavLink>,
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const chart = await new ChartsApi(SherlockConfiguration)
    .apiV2ChartsPost(
      {
        chart: {
          ...formDataToObject(formData),
          chartExposesEndpoint: formData.get("chartExposesEndpoint") === "true",
          defaultPort: ((defaultPort) =>
            typeof defaultPort === "string" && defaultPort !== ""
              ? parseInt(defaultPort)
              : undefined)(formData.get("defaultPort")),
        },
      },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);

  return redirect(`/charts/${chart?.name || ""}`);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsNewRoute: FunctionComponent = () => {
  const defaultEditableValues: V2controllersChart = {
    chartRepo: "terra-helm",
  };
  return (
    <div className="flex flex-row h-full grow">
      <NewPanel
        name="Chart"
        borderClassName="border-sky-300"
        backgroundClassName="bg-sky-50"
      >
        <ChartCreatableFields />
        <p>Fields below this point can be edited after creation.</p>
        <ChartEditableFields chart={defaultEditableValues} />
      </NewPanel>
      <Outlet />
    </div>
  );
};

export default ChartsNewRoute;
