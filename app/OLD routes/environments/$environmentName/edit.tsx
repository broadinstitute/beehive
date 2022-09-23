import { ActionFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useActionData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersCluster,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent, useState } from "react";
import { verifyAuthenticityToken } from "remix-utils";
import EditPanel from "~/components/OLD panels/edit";
import { EnvironmentEditableFields } from "~/components/OLD sherlock/environment";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  bradcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/environments/${params.environmentName}/edit`}>
        Edit
      </NavLink>
    );
  },
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData, false),
    requiresSuitability: formData.get("requiresSuitability") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
  };
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorPatch(
      {
        selector: params.environmentName || "",
        environment: environmentRequest,
      },
      forwardIAP(request)
    )
    .then(
      (environment) => redirect(`/environments/${environment?.name}`),
      makeErrorResponserReturner(environmentRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: FunctionComponent = () => {
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();
  const [defaultCluster, setDefaultcluster] = useState(
    actionData?.faultyRequest.defaultCluster || environment.defaultCluster || ""
  );
  return (
    <div className="flex flex-row h-full">
      <EditPanel
        name={environment.name}
        borderClassName="border-amber-300"
        backgroundClassName="bg-amber-50"
      >
        <EnvironmentEditableFields
          environment={actionData?.faultyRequest ?? environment}
          defaultCluster={defaultCluster}
        />
        {actionData && displayErrorInfo(actionData)}
      </EditPanel>
      <Outlet context={{ setDefaultcluster }} />
    </div>
  );
};

export default EditRoute;
