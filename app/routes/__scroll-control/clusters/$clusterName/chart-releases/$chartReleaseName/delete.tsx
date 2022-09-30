import { ActionFunction, redirect } from "@remix-run/node";
import {
  useParams,
  NavLink,
  useOutletContext,
  useActionData,
} from "@remix-run/react";
import {
  ChartReleasesApi,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { ChartReleaseDeleteDescription } from "~/components/content/chart-release/chart-release-delete-description";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Leaf } from "~/components/route-tree/leaf";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink
        to={`/clusters/${params.clusterName}/chart-releases/${params.chartReleaseName}/delete`}
      >
        Delete
      </NavLink>
    );
  },
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  return new ChartReleasesApi(SherlockConfiguration)
    .apiV2ChartReleasesSelectorDelete(
      { selector: params.chartReleaseName || "" },
      forwardIAP(request)
    )
    .then(
      () => redirect(`/clusters/${params.clusterName}/chart-releases`),
      errorResponseReturner
    );
};

const DeleteRoute: React.FunctionComponent = () => {
  const { chartRelease } = useOutletContext<{
    chartRelease: V2controllersChartRelease;
  }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Leaf>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${chartRelease.name}`}
          submitText="Click to Delete"
          {...ChartReleaseColors}
        >
          <ChartReleaseDeleteDescription />
          <DeletionGuard name={chartRelease.name} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Leaf>
  );
};

export default DeleteRoute;
