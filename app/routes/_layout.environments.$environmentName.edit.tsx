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
import { ActionButton } from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { EnvironmentEditableFields } from "~/features/sherlock/environments/edit/environment-editable-fields";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentHelpCopy } from "~/features/sherlock/environments/environment-help-copy";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { clusterSorter } from "../features/sherlock/clusters/list/cluster-sorter";
import { ListClusterButtonText } from "../features/sherlock/clusters/list/list-cluster-button-text";
import { matchCluster } from "../features/sherlock/clusters/list/match-cluster";
import { EditEnvironmentSidebarModes } from "../features/sherlock/environments/edit/edit-environment-sidebar-modes";
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
    chartReleasesFromTemplate:
      formData.get("chartReleasesFromTemplate") === "true",
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

  const [sidebar, setSidebar] =
    useState<EditEnvironmentSidebarModes>("help text");

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${environment.name}`}
          submitText="Click to Save Edits"
          {...EnvironmentColors}
        >
          <EnvironmentEditableFields
            environment={errorInfo?.formState || environment}
            defaultCluster={defaultCluster}
            setDefaultCluster={setDefaultCluster}
            setShowDefaultClusterPicker={() =>
              setSidebar("select default cluster")
            }
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={sidebar === "help text"}>
        {sidebar === "help text" && (
          <FillerText>
            <EnvironmentHelpCopy />
          </FillerText>
        )}
        {sidebar === "select default cluster" && (
          <InteractiveList title="Select Default Cluster" {...ClusterColors}>
            <ListFilterInfo filterText={defaultCluster} />
            <MemoryFilteredList
              entries={clusters}
              filterText={defaultCluster}
              filter={matchCluster}
            >
              {(cluster, index) => (
                <ActionButton
                  key={index.toString()}
                  onClick={() => {
                    setDefaultCluster(cluster.name || "");
                    setSidebar("help text");
                  }}
                  isActive={cluster.name === defaultCluster}
                  {...ClusterColors}
                >
                  <ListClusterButtonText cluster={cluster} />
                </ActionButton>
              )}
            </MemoryFilteredList>
          </InteractiveList>
        )}
      </InsetPanel>
    </>
  );
}
