import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import {
  ClustersApi,
  EnvironmentsApi,
  UsersApi,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { EnvironmentEditableFields } from "~/features/sherlock/environments/edit/environment-editable-fields";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentHelpCopy } from "~/features/sherlock/environments/environment-help-copy";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { makeUserSorter } from "~/features/sherlock/users/list/user-sorter";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getUserEmail } from "~/helpers/get-user-email.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { clusterSorter } from "../features/sherlock/clusters/list/cluster-sorter";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/edit`}>Edit</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Edit` },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return Promise.all([
    new ClustersApi(SherlockConfiguration)
      .apiClustersV3Get({}, handleIAP(request))
      .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower),
    new UsersApi(SherlockConfiguration)
      .apiUsersV3Get({}, handleIAP(request))
      .then(
        (users) => users.sort(makeUserSorter(getUserEmail(request))),
        errorResponseThrower,
      ),
  ]);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const environmentRequest: SherlockEnvironmentV3 = {
    ...formDataToObject(formData, false),
    requiresSuitability: formData.get("requiresSuitability") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
    preventDeletion: formData.get("preventDeletion") === "true",
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiEnvironmentsV3SelectorPatch(
      {
        selector: params.environmentName || "",
        environment: environmentRequest,
      },
      handleIAP(request),
    )
    .then(
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponseReturner(environmentRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [clusters, users] = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environment } = useEnvironmentContext();

  const [defaultCluster, setDefaultCluster] = useState(
    errorInfo?.formState?.defaultCluster || environment.defaultCluster || "",
  );

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${environment.name}`}
          submitText="Click to Save Edits"
          {...EnvironmentColors}
        >
          <EnvironmentEditableFields
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            clusters={clusters}
            users={users}
            environment={errorInfo?.formState || environment}
            defaultCluster={defaultCluster}
            setDefaultCluster={setDefaultCluster}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        {isSidebarPresent ? (
          <SidebarComponent />
        ) : (
          <FillerText>
            <EnvironmentHelpCopy />
          </FillerText>
        )}
      </InsetPanel>
    </>
  );
}
