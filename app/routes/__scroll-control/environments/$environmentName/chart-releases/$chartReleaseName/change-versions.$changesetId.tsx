import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  useActionData,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  ChangesetsApi,
  V2controllersChangeset,
  V2controllersChartRelease,
} from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Leaf } from "~/components/route-tree/leaf";
import {
  ChangesetApplyDetails,
  ChangesetColors,
} from "~/components/content/changeset";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  errorResponseThrower,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink
        to={`/environments/${params.environmentName}/chart-releases/${params.chartReleaseName}/change-versions/${params.changesetId}`}
      >
        Apply Version Changes
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ChangesetsSelectorGet(
      { selector: params.changesetId || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ProceduresChangesetsApplyPost(
      { applyRequest: [params.changesetId || ""] },
      forwardIAP(request)
    )
    .then(
      () =>
        redirect(
          `/environments/${params.environmentName}/chart-releases/${params.chartReleaseName}`
        ),
      errorResponseReturner
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const ChangeVersionsChangesetIDRoute: React.FunctionComponent = () => {
  const actionData = useActionData<DerivedErrorInfo>();
  const { chartRelease } = useOutletContext<{
    chartRelease: V2controllersChartRelease;
  }>();
  const changeset = useLoaderData<V2controllersChangeset>();
  return (
    <Leaf>
      <OutsetPanel>
        <ActionBox
          title="Apply Version Changes"
          submitText="Apply Version Changes"
          {...ChangesetColors}
        >
          <ChangesetApplyDetails
            chartRelease={chartRelease}
            changeset={changeset}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Leaf>
  );
};

export default ChangeVersionsChangesetIDRoute;
