import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useParams,
} from "@remix-run/react";
import {
  V2controllersEnvironment,
  EnvironmentsApi,
  V2controllersCluster,
  ClustersApi,
} from "@sherlock-js-client/sherlock";
import { useState, useEffect } from "react";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { EnvironmentEditableFields } from "~/components/content/environment/environment-editable-fields";
import { EnvironmentHelpCopy } from "~/components/content/environment/environment-help-copy";
import ActionButton from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { ActionBox } from "~/components/panel-structures/action-box";
import {
  FillerTextProps,
  FillerText,
} from "~/components/panel-structures/filler-text";
import {
  InteractiveListProps,
  InteractiveList,
} from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  SherlockConfiguration,
  forwardIAP,
  makeErrorResponserReturner,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/edit`}>Edit</NavLink>
  ),
};

export const loader: LoaderFunction = async ({ request }) => {
  return new ClustersApi(SherlockConfiguration)
    .apiV2ClustersGet({}, forwardIAP(request))
    .catch(errorResponseThrower);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData, false),
    chartReleasesFromTemplate:
      formData.get("chartReleasesFromTemplate") === "true",
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
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponserReturner(environmentRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EditRoute: React.FunctionComponent = () => {
  const clusters = useLoaderData<Array<V2controllersCluster>>();
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();

  const [defaultCluster, setDefaultCluster] = useState(
    actionData?.faultyRequest.defaultCluster || environment.defaultCluster || ""
  );
  const [showDefaultClusterPicker, setShowDefaultClusterPicker] =
    useState(false);

  let sidebar: React.ReactElement<InteractiveListProps | FillerTextProps>;
  if (showDefaultClusterPicker) {
    sidebar = (
      <InteractiveList title="Select Default Cluster" {...ClusterColors}>
        <ListFilterInfo filterText={defaultCluster} />
        <MemoryFilteredList
          entries={clusters}
          filterText={defaultCluster}
          filter={(cluster, filterText) =>
            cluster.base?.includes(filterText) ||
            cluster.name?.includes(filterText)
          }
        >
          {(cluster, index) => (
            <ActionButton
              key={index.toString()}
              onClick={() => {
                setDefaultCluster(cluster.name || "");
                setShowDefaultClusterPicker(false);
              }}
              isActive={cluster.name === defaultCluster}
              {...ClusterColors}
            >
              <h2 className="font-light">
                {`${cluster.base} / `}
                <span className="font-medium">{cluster.name}</span>
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else {
    sidebar = (
      <FillerText>
        <EnvironmentHelpCopy />
      </FillerText>
    );
  }

  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title={`Now Editing ${environment.name}`}
          submitText="Click to Save Edits"
          {...EnvironmentColors}
        >
          <EnvironmentEditableFields
            environment={actionData?.faultyRequest || environment}
            defaultCluster={defaultCluster}
            setDefaultCluster={setDefaultCluster}
            setShowDefaultClusterPicker={setShowDefaultClusterPicker}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      <Leaf>
        <InsetPanel>{sidebar}</InsetPanel>
      </Leaf>
    </Branch>
  );
};

export default EditRoute;
