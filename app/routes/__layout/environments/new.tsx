import { Octokit } from "@octokit/rest";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  NavLink,
  useActionData,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import {
  ClustersApi,
  EnvironmentsApi,
  V2controllersCluster,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";

import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ClusterColors } from "~/components/content/cluster/cluster-colors";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { EnvironmentCreatableFields } from "~/components/content/environment/environment-creatable-fields";
import { EnvironmentEditableFields } from "~/components/content/environment/environment-editable-fields";
import { EnvironmentHelpCopy } from "~/components/content/environment/environment-help-copy";
import ActionButton from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import {
  InteractiveList,
  InteractiveListProps,
} from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseThrower,
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { commitSession, getSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/environments/new">New</NavLink>,
};

export const meta: MetaFunction = () => ({
  title: "New Environment",
});

export const loader: LoaderFunction = async ({ request }) => {
  return Promise.all([
    // https://cloud.google.com/iap/docs/identity-howto#getting_the_users_identity_with_signed_headers
    request.headers.get("X-Goog-Authenticated-User-Email")?.split(":").at(-1) ||
      null,
    new ClustersApi(SherlockConfiguration)
      .apiV2ClustersGet({}, forwardIAP(request))
      .catch(errorResponseThrower),
  ]);
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData, true),
    chartReleasesFromTemplate:
      formData.get("chartReleasesFromTemplate") === "true",
    requiresSuitability: formData.get("requiresSuitability") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
    preventDeletion: formData.get("preventDeletion") === "true",
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsPost(
      { environment: environmentRequest },
      forwardIAP(request)
    )
    .then(async (environment) => {
      if (environment.lifecycle === "dynamic") {
        const payload = {
          owner: "broadinstitute",
          repo: "terra-github-workflows",
          workflow_id: ".github/workflows/bee-provision.yaml",
          ref: "main",
          inputs: {
            "bee-name": environment.name || "",
          },
        };
        console.log(
          `environment create workflow dispatch: ${JSON.stringify(payload)}`
        );
        const notification = await new Octokit({
          auth: session.get(sessionFields.githubAccessToken),
        }).actions
          .createWorkflowDispatch(payload)
          .then(
            (): Notification => ({
              type: "gha",
              text: "A GitHub Action has been started to provision your BEE",
              url: "https://github.com/broadinstitute/terra-github-workflows/actions/workflows/bee-provision.yaml",
            }),
            (rejected): Notification => ({
              type: "error",
              text: `There was a problem calling the GitHub Action to provision your BEE: ${JSON.stringify(
                rejected
              )}`,
              error: true,
            })
          );
        session.flash(
          sessionFields.flashNotifications,
          buildNotifications(notification)
        );
      }
      return redirect(`/environments/${environment.name}`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }, makeErrorResponserReturner(environmentRequest));
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const NewRoute: React.FunctionComponent = () => {
  const [userEmail, clusters] =
    useLoaderData<[string | null, Array<V2controllersCluster>]>();
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();
  const { environments } = useOutletContext<{
    environments: Array<V2controllersEnvironment>;
  }>();

  const [lifecycle, setLifecycle] = useState(
    actionData?.faultyRequest.lifecycle || "dynamic"
  );
  const [templateEnvironment, setTemplateEnvironment] = useState(
    actionData?.faultyRequest.templateEnvironment || ""
  );
  const [showTemplateEnvironmentPicker, setShowTemplateEnvironmentPicker] =
    useState(false);
  const [defaultCluster, setDefaultCluster] = useState(
    actionData?.faultyRequest.defaultCluster || ""
  );
  const [showDefaultClusterPicker, setShowDefaultClusterPicker] =
    useState(false);

  let sidebar: React.ReactElement<InteractiveListProps> | undefined;
  if (showTemplateEnvironmentPicker) {
    sidebar = (
      <InteractiveList
        title="Select Template Environment"
        {...EnvironmentColors}
      >
        <ListFilterInfo filterText={templateEnvironment} />
        <MemoryFilteredList
          entries={environments.filter(
            (environment) => environment.lifecycle === "template"
          )}
          filterText={templateEnvironment}
          filter={(environment, filterText) =>
            environment.base?.includes(filterText) ||
            environment.name?.includes(filterText)
          }
        >
          {(environment, index) => (
            <ActionButton
              key={index.toString()}
              onClick={() => {
                setTemplateEnvironment(environment.name || "");
                setShowTemplateEnvironmentPicker(false);
              }}
              isActive={environment.name === templateEnvironment}
              {...EnvironmentColors}
            >
              <h2 className="font-light">
                {`template: ${environment.base} / `}
                <span className="font-medium">{environment.name}</span>
              </h2>
            </ActionButton>
          )}
        </MemoryFilteredList>
      </InteractiveList>
    );
  } else if (showDefaultClusterPicker) {
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
  }

  return (
    <Branch>
      <OutsetPanel {...EnvironmentColors}>
        <ActionBox
          title="Now Creating New Environment"
          submitText="Click to Create"
          {...EnvironmentColors}
        >
          <EnvironmentCreatableFields
            environment={actionData?.faultyRequest}
            lifecycle={lifecycle}
            setLifecycle={setLifecycle}
            templateEnvironment={templateEnvironment}
            setTemplateEnvironment={setTemplateEnvironment}
            setShowTemplateEnvironmentPicker={setShowTemplateEnvironmentPicker}
            hideOtherPickers={() => setShowDefaultClusterPicker(false)}
          />
          <p className="py-4">Fields below this point can be edited later.</p>
          <EnvironmentEditableFields
            environment={actionData?.faultyRequest}
            creating={true}
            templateInUse={lifecycle === "dynamic"}
            defaultCluster={defaultCluster}
            setDefaultCluster={setDefaultCluster}
            setShowDefaultClusterPicker={setShowDefaultClusterPicker}
            hideOtherPickers={() => setShowTemplateEnvironmentPicker(false)}
            userEmail={userEmail}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      {(sidebar && (
        <Branch>
          <InsetPanel>{sidebar}</InsetPanel>
        </Branch>
      )) || (
        <Leaf>
          <InsetPanel>
            <FillerText>
              <EnvironmentHelpCopy />
            </FillerText>
          </InsetPanel>
        </Leaf>
      )}
    </Branch>
  );
};

export default NewRoute;
