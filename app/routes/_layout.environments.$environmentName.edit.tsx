import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import {
  ClustersApi,
  EnvironmentsApi,
  V2controllersEnvironment,
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
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
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

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Edit` },
];

export async function loader({ request }: LoaderArgs) {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersGet({}, forwardIAP(request))
    .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData, false),
    requiresSuitability: formData.get("requiresSuitability") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
    preventDeletion: formData.get("preventDeletion") === "true",
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
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponseReturner(environmentRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const clusters = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environment } = useEnvironmentContext();

  const [defaultCluster, setDefaultCluster] = useState(
    errorInfo?.formState?.defaultCluster || environment.defaultCluster || ""
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
