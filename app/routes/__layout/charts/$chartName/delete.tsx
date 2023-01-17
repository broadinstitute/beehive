import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartColors } from "~/components/content/chart/chart-colors";
import { ChartDeleteDescription } from "~/components/content/chart/chart-delete-description";
import { DeletionGuard } from "~/components/interactivity/deletion-guard";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/delete`}>Delete</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.chartName} - Chart - Delete`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsSelectorDelete(
      { selector: params.chartName || "" },
      forwardIAP(request)
    )
    .then(() => redirect("/charts"), errorResponseReturner);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const DeleteRoute: React.FunctionComponent = () => {
  const { chart } = useOutletContext<{ chart: V2controllersChart }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${chart.name}`}
          submitText={`Click to Delete`}
          {...ChartColors}
        >
          <ChartDeleteDescription />
          <DeletionGuard name={chart.name} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default DeleteRoute;
