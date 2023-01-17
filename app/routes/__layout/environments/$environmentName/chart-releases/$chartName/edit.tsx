import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartReleaseEditableFields } from "~/components/content/chart-release/chart-release-editable-fields";
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
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/edit`}
    >
      Edit
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Chart Instance - Edit`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const chartReleaseRequest: V2controllersChartRelease = {
    ...formDataToObject(formData, false),
    port: ((port) =>
      typeof port === "string" && port !== "" ? parseInt(port) : undefined)(
      formData.get("port")
    ),
  };

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorPatch(
      {
        selector: `${params.environmentName}/${params.chartName}`,
        chartRelease: chartReleaseRequest,
      },
      forwardIAP(request)
    )
    .then(
      () =>
        redirect(
          `/environments/${params.environmentName}/chart-releases/${params.chartName}`
        ),
      makeErrorResponserReturner(chartReleaseRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const { chartRelease } = useOutletContext<{
    chartRelease: V2controllersChartRelease;
  }>();
  const actionData =
    useActionData<ActionErrorInfo<V2controllersChartRelease>>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${chartRelease.name}`}
          submitText="Click to Save Edits"
          {...ChartReleaseColors}
        >
          {(chartRelease.chartInfo?.chartExposesEndpoint && (
            <ChartReleaseEditableFields
              defaultSubdomain={
                actionData?.faultyRequest.subdomain || chartRelease.subdomain
              }
              defaultProtocol={
                actionData?.faultyRequest.protocol || chartRelease.protocol
              }
              defaultPort={
                actionData?.faultyRequest.port?.toString() ||
                chartRelease.port?.toString()
              }
              baseDomain={
                chartRelease.environmentInfo?.namePrefixesDomain
                  ? `${chartRelease.environmentInfo.name}.${chartRelease.environmentInfo.baseDomain}`
                  : chartRelease.environmentInfo?.baseDomain
              }
            />
          )) || (
            <p>
              This chart isn't flagged as having a Beehive-tracked endpoint so
              those options aren't available here.
            </p>
          )}
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default EditRoute;
