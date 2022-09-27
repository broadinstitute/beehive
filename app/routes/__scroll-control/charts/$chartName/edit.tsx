import { ActionFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  useActionData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartColors, ChartEditableFields } from "~/components/content/chart";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
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
  const chartRequest: V2controllersChart = {
    ...formDataToObject(formData, false),
    chartExposesEndpoint: formData.get("chartExposesEndpoint") === "true",
    defaultPort: ((defaultPort) =>
      typeof defaultPort === "string" && defaultPort !== ""
        ? parseInt(defaultPort)
        : undefined)(formData.get("defaultPort")),
  };
  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorPatch(
      {
        selector: params.chartName || "",
        chart: chartRequest,
      },
      forwardIAP(request)
    )
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponserReturner(chartRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersChart>>();
  return (
    <Leaf>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}`}
          submitText="Click to Save Edits"
          {...ChartColors}
        >
          <ChartEditableFields chart={actionData?.faultyRequest ?? chart} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Leaf>
  );
};

export default EditRoute;
