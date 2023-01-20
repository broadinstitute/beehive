import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  PagerdutyAlertSummary,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { IncidentSummaryFields } from "~/components/content/pagerduty-integration/incident-summary-fields";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { Branch } from "~/components/route-tree/branch";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/general-incident`}
    >
      General Incident
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Trigger Incident - General`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const summaryRequest: PagerdutyAlertSummary = {
    ...formDataToObject(formData, true),
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2ProceduresEnvironmentsTriggerIncidentSelectorPost(
      {
        selector: params.environmentName || "",
        summary: summaryRequest,
      },
      forwardIAP(request)
    )
    .then((response) => {
      console.log(response);
      return redirect(
        `/trigger-incident/${params.environmentName}/general-incident/success`
      );
    });
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const GeneralIncidentRoute: React.FunctionComponent = () => {
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<ActionErrorInfo<PagerdutyAlertSummary>>();

  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Preparing to Trigger General Incident for ${environment.name}`}
          submitText="Click to Trigger General Incident"
          {...EnvironmentColors}
        >
          <IncidentSummaryFields />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Branch>
  );
};

export default GeneralIncidentRoute;
