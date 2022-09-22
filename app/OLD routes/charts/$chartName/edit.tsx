import { ActionFunction } from "@remix-run/node";
import { NavLink, useOutletContext, useParams } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { verifyAuthenticityToken } from "remix-utils";
import EditPanel from "~/components/OLD panels/edit";
import { catchBoundary, errorBoundary } from "~/helpers/boundaries";
import { ChartEditableFields } from "~/components/OLD sherlock/chart";
import {
  formDataToObject,
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return <NavLink to={`/charts/${params.chartName}/edit`}>Edit</NavLink>;
  },
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorPatch(
      {
        selector: params.chartName || "",
        chart: {
          ...formDataToObject(formData, false),
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
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChartsChartNameEditRoute: FunctionComponent = () => {
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  return (
    <div className="shrink-0 grow bg-white overflow-y-auto">
      <EditPanel
        name={chart.name}
        borderClassName="border-sky-300"
        backgroundClassName="bg-sky-50"
      >
        <ChartEditableFields chart={chart} />
      </EditPanel>
    </div>
  );
};

export default ChartsChartNameEditRoute;
