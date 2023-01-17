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
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartReleaseDeleteDescription } from "~/components/content/chart-release/chart-release-delete-description";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/delete`}
    >
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Chart Instance - Delete`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorDelete(
      { selector: `${params.environmentName}/${params.chartName}` },
      forwardIAP(request)
    )
    .then(
      () => redirect(`/environments/${params.environmentName}/chart-releases`),
      errorResponseReturner
    );
};

const DeleteRoute: React.FunctionComponent = () => {
  const { chartRelease } = useOutletContext<{
    chartRelease: V2controllersChartRelease;
  }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${chartRelease.name}`}
          submitText="Click to Delete"
          {...ChartReleaseColors}
        >
          <ChartReleaseDeleteDescription
            environment={chartRelease.environmentInfo}
          />
          <DeletionGuard name={chartRelease.name} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default DeleteRoute;
