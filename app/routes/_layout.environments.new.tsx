import { Octokit } from "@octokit/rest";
import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import {
  ClustersApi,
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";

import { ActionButton } from "~/components/interactivity/action-button";
import { ListFilterInfo } from "~/components/interactivity/list-filter-info";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { ClusterColors } from "~/features/sherlock/clusters/cluster-colors";
import { EnvironmentEditableFields } from "~/features/sherlock/environments/edit/environment-editable-fields";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentHelpCopy } from "~/features/sherlock/environments/environment-help-copy";
import { DuplicateBeeWarning } from "~/features/sherlock/environments/new/duplicate-bee-warning";
import { EnvironmentCreatableFields } from "~/features/sherlock/environments/new/environment-creatable-fields";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { commitSession, sessionFields } from "~/session.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { clusterSorter } from "../features/sherlock/clusters/list/cluster-sorter";
import { ListClusterButtonText } from "../features/sherlock/clusters/list/list-cluster-button-text";
import { matchCluster } from "../features/sherlock/clusters/list/match-cluster";
import { ListEnvironmentButtonText } from "../features/sherlock/environments/list/list-environment-button-text";
import { matchEnvironment } from "../features/sherlock/environments/list/match-environment";
import { NewEnvironmentSidebarModes } from "../features/sherlock/environments/new/new-environment-sidebar-modes";
import { getValidSession } from "../helpers/get-valid-session.server";
import { useEnvironmentsContext } from "./_layout.environments";

export const handle = {
  breadcrumb: () => <NavLink to="/environments/new">New</NavLink>,
};

export const meta: V2_MetaFunction = () => [
  {
    title: "New Environment",
  },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const preconfiguredLifecycle = url.searchParams.get("lifecycle");
  return Promise.all([
    // https://cloud.google.com/iap/docs/identity-howto#getting_the_users_identity_with_signed_headers
    request.headers.get("X-Goog-Authenticated-User-Email")?.split(":").at(-1) ||
      null,
    new ClustersApi(SherlockConfiguration)
      .apiV2ClustersGet({}, forwardIAP(request))
      .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower),
    preconfiguredLifecycle,
  ]);
}

export async function action({ request }: ActionArgs) {
  const session = await getValidSession(request);

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
    }, makeErrorResponseReturner(environmentRequest));
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const [userEmail, clusters, preconfiguredLifecycle] =
    useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environments } = useEnvironmentsContext();

  const [lifecycle, setLifecycle] = useState(
    errorInfo?.formState?.lifecycle || preconfiguredLifecycle || "dynamic"
  );
  const [templateEnvironment, setTemplateEnvironment] = useState(
    errorInfo?.formState?.templateEnvironment || ""
  );
  const [defaultCluster, setDefaultCluster] = useState(
    errorInfo?.formState?.defaultCluster || ""
  );

  let potentialDuplicates = useMemo(
    () =>
      environments.filter(
        (environment) =>
          environment.lifecycle === "dynamic" &&
          environment.owner === userEmail &&
          environment.templateEnvironment === templateEnvironment
      ),
    [userEmail, environments, lifecycle, templateEnvironment]
  );

  // TODO: make sidebar have type React.ReactNode
  const [sidebar, setSidebar] =
    useState<NewEnvironmentSidebarModes>("help text");

  return (
    <>
      <OutsetPanel {...EnvironmentColors}>
        <ActionBox
          title="Now Creating New Environment"
          submitText="Click to Create"
          {...EnvironmentColors}
        >
          <EnvironmentCreatableFields
            environment={errorInfo?.formState}
            lifecycle={lifecycle}
            setLifecycle={setLifecycle}
            templateEnvironment={templateEnvironment}
            setTemplateEnvironment={setTemplateEnvironment}
            setShowTemplateEnvironmentPicker={() =>
              setSidebar("select template")
            }
          />
          <p className="py-4">Fields below this point can be edited later.</p>
          <EnvironmentEditableFields
            environment={errorInfo?.formState}
            creating={true}
            templateInUse={lifecycle === "dynamic"}
            defaultCluster={defaultCluster}
            setDefaultCluster={setDefaultCluster}
            setShowDefaultClusterPicker={() =>
              setSidebar("select default cluster")
            }
            userEmail={userEmail}
          />
          {potentialDuplicates.length > 0 &&
            lifecycle === "dynamic" &&
            templateEnvironment && (
              <DuplicateBeeWarning
                template={templateEnvironment}
                matchingEnvironmentNames={potentialDuplicates.map(
                  (environment) => environment.name || ""
                )}
              />
            )}
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel largeScreenOnly={sidebar === "help text"}>
        {sidebar === "help text" && (
          <FillerText>
            <EnvironmentHelpCopy />
          </FillerText>
        )}
        {sidebar === "select template" && (
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
              filter={matchEnvironment}
            >
              {(environment, index) => (
                <ActionButton
                  key={index.toString()}
                  onClick={() => {
                    setTemplateEnvironment(environment.name || "");
                    setSidebar("help text");
                  }}
                  isActive={environment.name === templateEnvironment}
                  {...EnvironmentColors}
                >
                  <ListEnvironmentButtonText environment={environment} />
                </ActionButton>
              )}
            </MemoryFilteredList>
          </InteractiveList>
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
