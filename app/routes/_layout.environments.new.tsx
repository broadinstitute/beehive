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
import { EnumInputSelect } from "~/components/interactivity/enum-select";

import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import {
  buildNotifications,
  Notification,
} from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
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
import { useSidebar } from "~/hooks/use-sidebar";
import { commitSession, sessionFields } from "~/session.server";
import { PanelErrorBoundary } from "../errors/components/error-boundary";
import { FormErrorDisplay } from "../errors/components/form-error-display";
import {
  errorResponseThrower,
  makeErrorResponseReturner,
} from "../errors/helpers/error-response-handlers";
import { clusterSorter } from "../features/sherlock/clusters/list/cluster-sorter";
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
    autoPopulateChartReleases:
      formData.get("autoPopulateChartReleases") === "true",
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
      if (
        environment.lifecycle === "dynamic" &&
        formData.get("action") !== "none"
      ) {
        const payload = {
          owner: "broadinstitute",
          repo: "terra-github-workflows",
          workflow_id: ".github/workflows/bee-provision.yaml",
          ref: "main",
          inputs: {
            "bee-name": environment.name || "",
            "provision-only": (
              formData.get("action") === "provision"
            ).toString(),
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

  const [actionToRun, setActionToRun] = useState("provision-seed");

  const {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    SidebarComponent,
  } = useSidebar();

  return (
    <>
      <OutsetPanel {...EnvironmentColors}>
        <ActionBox
          title="Now Creating New Environment"
          submitText="Click to Create"
          {...EnvironmentColors}
        >
          <EnvironmentCreatableFields
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            environment={errorInfo?.formState}
            templateEnvironments={environments.filter(
              (environment) => environment.lifecycle === "template"
            )}
            lifecycle={lifecycle}
            setLifecycle={setLifecycle}
            templateEnvironment={templateEnvironment}
            setTemplateEnvironment={setTemplateEnvironment}
          />
          <details className="pt-2">
            <summary className="cursor-pointer font-light text-2xl">
              Click to Expand Advanced Configuration
            </summary>
            <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col gap-4">
              {lifecycle === "dynamic" && (
                <>
                  <div>
                    <h2 className="font-light text-2xl">Action to Run</h2>
                    <EnumInputSelect
                      name="action"
                      className="grid grid-cols-3 mt-2"
                      fieldValue={actionToRun}
                      setFieldValue={setActionToRun}
                      enums={[
                        ["Provision + Seed", "provision-seed"],
                        ["Provision", "provision"],
                        ["None", "none"],
                      ]}
                      {...EnvironmentColors}
                    />
                  </div>
                  <div className="pl-6 border-l-2 border-color-divider-line flex flex-col gap-2">
                    {actionToRun === "provision-seed" && (
                      <>
                        <p>
                          When creating, a GitHub Action will be kicked off to
                          both provision the BEE in our infrastructure and seed
                          it with some initial data.
                        </p>
                        <p>
                          The seeding process is modeled after legacy FiaB
                          behavior. It will skip steps as needed if some
                          services aren't included in the BEE.
                        </p>
                        <p>
                          DevOps recommends modern seeding be done via the
                          services themselves, Kubernetes Jobs, or GitHub
                          Actions.
                        </p>
                      </>
                    )}
                    {actionToRun === "provision" && (
                      <p>
                        When creating, a GitHub Action will be kicked off to
                        provision the BEE in our infrastructure. The BEE will
                        not receive legacy FiaB-style seeding.
                      </p>
                    )}
                    {actionToRun === "none" && (
                      <p>
                        When creating, no GitHub Action will be kicked off.
                        Manual intervention will be required to bring the BEE
                        online, for example via "thelma bee provision."
                      </p>
                    )}
                  </div>
                </>
              )}
              <p className="py-4 font-semibold">
                The fields below this point can be edited later but some do have
                an initial impact during creation.
              </p>
              <EnvironmentEditableFields
                setSidebar={setSidebar}
                setSidebarFilterText={setSidebarFilterText}
                clusters={clusters}
                environment={errorInfo?.formState}
                creating={true}
                templateInUse={lifecycle === "dynamic"}
                defaultCluster={defaultCluster}
                setDefaultCluster={setDefaultCluster}
                userEmail={userEmail}
              />
            </div>
          </details>
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
      <InsetPanel largeScreenOnly={!isSidebarPresent}>
        {<SidebarComponent /> || (
          <FillerText>
            <EnvironmentHelpCopy />
          </FillerText>
        )}
      </InsetPanel>
    </>
  );
}
