import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  Params,
  NavLink,
  useOutletContext,
  useActionData,
} from "@remix-run/react";
import {
  PagerdutyIntegrationsApi,
  V2controllersPagerdutyIntegration,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { PagerdutyIntegrationColors } from "~/components/content/pagerduty-integration/pagerduty-integration-colors";
import { PagerdutyIntegrationDeleteDescription } from "~/components/content/pagerduty-integration/pagerduty-integration-delete-description";
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
    <NavLink to={`/pagerduty-integrations/${params.pagerdutyID}/delete`}>
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = () => ({
  title: "Details - PagerDuty Integration - Delete",
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  return new PagerdutyIntegrationsApi(SherlockConfiguration)
    .apiV2PagerdutyIntegrationsSelectorDelete(
      { selector: `pd-id/${params.pagerdutyID}` },
      forwardIAP(request)
    )
    .then(() => redirect("/pagerduty-integrations"), errorResponseReturner);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const DeleteRoute: React.FunctionComponent = () => {
  const { pagerdutyIntegration } = useOutletContext<{
    pagerdutyIntegration: V2controllersPagerdutyIntegration;
  }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${pagerdutyIntegration.name} from Sherlock`}
          submitText="Click to Delete"
          {...PagerdutyIntegrationColors}
        >
          <PagerdutyIntegrationDeleteDescription />
          <DeletionGuard name={pagerdutyIntegration.name} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default DeleteRoute;
