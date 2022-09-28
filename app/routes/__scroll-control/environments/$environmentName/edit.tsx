import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import {
  NavLink,
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
} from "@sherlock-js-client/sherlock";
import { useState, useEffect } from "react";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster";
import {
  EnvironmentColors,
  EnvironmentEditableFields,
  EnvironmentHelpCopy,
} from "~/components/content/environment";
import ActionButton from "~/components/interactivity/action-button";
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
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/environments/${params.environmentName}/edit`}>
        Edit
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  return (
    // https://cloud.google.com/iap/docs/identity-howto#getting_the_users_identity_with_signed_headers
    request.headers.get("X-Goog-Authenticated-User-Email")?.split(":").at(-1) ||
    null
  );
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
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const userEmail = useLoaderData<string | null>();
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();

  const [defaultCluster, setDefaultCluster] = useState(
    actionData?.faultyRequest.defaultCluster || environment.defaultCluster || ""
  );
  const [showDefaultClusterPicker, setShowDefaultClusterPicker] =
    useState(false);

  // Get the clusters manually for the list of possible default clusters
  const defaultClusterFetcher = useFetcher();
  useEffect(() => {
    if (defaultClusterFetcher.type == "init") {
      defaultClusterFetcher.load("/clusters");
    }
  }, [defaultClusterFetcher]);

  let sidebar: React.ReactElement<InteractiveListProps | FillerTextProps>;
  if (showDefaultClusterPicker && defaultClusterFetcher.type == "done") {
    sidebar = (
      <InteractiveList title="Select Default Cluster" {...ClusterColors}>
        <MemoryFilteredList
          entries={defaultClusterFetcher.data as Array<V2controllersCluster>}
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
            userEmail={userEmail}
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
