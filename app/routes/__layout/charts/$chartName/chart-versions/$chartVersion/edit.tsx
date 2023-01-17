import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartVersionsApi,
  V2controllersChartVersion,
  V2controllersChart,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartVersionColors } from "~/components/content/chart-version/chart-version-colors";
import { ChartVersionEditableFields } from "~/components/content/chart-version/chart-version-editable-fields";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => {
    return (
      <NavLink
        to={`/charts/${params.chartName}/chart-versions/${params.chartVersion}/edit`}
      >
        Edit
      </NavLink>
    );
  },
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName}/${params.chartVersion} - Chart Version - Edit`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const chartVersionRequest: V2controllersChartVersion = {
    ...formDataToObject(formData, false),
  };

  return new ChartVersionsApi(SherlockConfiguration)
    .apiV2ChartVersionsSelectorPatch(
      {
        selector: `${params.chartName}/${params.chartVersion}`,
        chartVersion: chartVersionRequest,
      },
      forwardIAP(request)
    )
    .then(
      (chartVersion) =>
        redirect(
          `/charts/${params.chartName}/chart-versions/${chartVersion.chartVersion}`
        ),
      makeErrorResponserReturner(chartVersionRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const { chart, chartVersion } = useOutletContext<{
    chart: V2controllersChart;
    chartVersion: V2controllersChartVersion;
  }>();
  const actionData =
    useActionData<ActionErrorInfo<V2controllersChartVersion>>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chart.name}/${chartVersion.chartVersion}`}
          submitText="Click to Save Edits"
          {...ChartVersionColors}
        >
          <ChartVersionEditableFields
            chartVersion={actionData?.faultyRequest ?? chartVersion}
            repo={
              chart.chartRepo === "terra-helm"
                ? "broadinstitute/terra-helmfile"
                : undefined
            }
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default EditRoute;
