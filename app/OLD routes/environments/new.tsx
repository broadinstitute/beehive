import { ActionFunction, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersCluster,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent, useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { verifyAuthenticityToken } from "remix-utils";
import NewPanel from "~/components/OLD panels/new";
import {
  EnvironmentCreatableFields,
  EnvironmentEditableFields,
} from "~/components/OLD sherlock/environment";
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
  breadcrumb: () => <NavLink to="/environments/new">New</NavLink>,
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData),
    chartReleasesFromTemplate:
      formData.get("chartReleasesFromTemplate") === "true",
    requiresSuitability: formData.get("requiresSuitability") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsPost(
      { environment: environmentRequest },
      forwardIAP(request)
    )
    .then(
      (environment) => redirect(`/environments/${environment?.name}`),
      makeErrorResponserReturner(environmentRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentsNewRoute: FunctionComponent = () => {
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();
  const defaultValues: V2controllersEnvironment = {};

  const [defaultCluster, setDefaultCluster] = useState(
    actionData?.faultyRequest.defaultCluster ||
      defaultValues.defaultCluster ||
      ""
  );
  return (
    <div className="flex flex-row h-full">
      <NewPanel
        name="Environment"
        borderClassName="border-amber-300"
        backgroundClassName="bg-amber-50"
      >
        <EnvironmentCreatableFields
          environment={actionData?.faultyRequest ?? defaultValues}
        />
        <p>Fields below this point can be edited after creation.</p>
        <EnvironmentEditableFields
          environment={actionData?.faultyRequest ?? defaultValues}
          defaultCluster={defaultCluster}
        />
        {actionData && displayErrorInfo(actionData)}
      </NewPanel>
      <Outlet context={{ setDefaultCluster }} />
    </div>
  );
};

export default EnvironmentsNewRoute;
