import { ActionFunction, MetaFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useOutletContext,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { EnvironmentDeleteDescription } from "~/components/content/environment/environment-delete-description";
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
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/delete`}>
      Delete
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Environment - Delete`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorDelete(
      { selector: params.environmentName || "" },
      forwardIAP(request)
    )
    .then(() => redirect("/environments"), errorResponseReturner);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const DeleteRoute: React.FunctionComponent = () => {
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<DerivedErrorInfo>();
  return (
    <Leaf>
      <OutsetPanel>
        <ActionBox
          title={`Now Deleting ${environment.name}`}
          submitText={`Click to Delete`}
          {...EnvironmentColors}
        >
          <EnvironmentDeleteDescription environment={environment} />
          {environment.lifecycle !== "dynamic" && (
            <DeletionGuard name={environment.name} />
          )}
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
    </Leaf>
  );
};

export default DeleteRoute;
