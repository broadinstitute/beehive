import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";
import {
  ClustersApi,
  EnvironmentsApi,
  RolesApi,
  UsersApi,
} from "@sherlock-js-client/sherlock";
import { useMemo, useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";

import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { runGha } from "~/features/github/run-gha";
import { EnvironmentEditableFields } from "~/features/sherlock/environments/edit/environment-editable-fields";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentHelpCopy } from "~/features/sherlock/environments/environment-help-copy";
import { makeEnvironmentSorter } from "~/features/sherlock/environments/list/environment-sorter";
import { DuplicateBeeWarning } from "~/features/sherlock/environments/new/duplicate-bee-warning";
import { EnvironmentAdvancedCreatableFields } from "~/features/sherlock/environments/new/environment-advanced-creatable-fields";
import { EnvironmentCreatableFields } from "~/features/sherlock/environments/new/environment-creatable-fields";
import { EnvironmentScheduleFields } from "~/features/sherlock/environments/offline/environment-schedule-fields";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { makeUserSorter } from "~/features/sherlock/users/list/user-sorter";
import { dateWithCustomISOString } from "~/helpers/date";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getUserEmail } from "~/helpers/get-user-email.server";
import { useSidebar } from "~/hooks/use-sidebar";
import { commitSession } from "~/session.server";
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

export const meta: MetaFunction = () => [
  {
    title: "New Environment",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const preconfiguredLifecycle = url.searchParams.get("lifecycle");
  const selfUserEmail = getUserEmail(request);
  return Promise.all([
    selfUserEmail,
    new ClustersApi(SherlockConfiguration)
      .apiClustersV3Get({}, handleIAP(request))
      .then((clusters) => clusters.sort(clusterSorter), errorResponseThrower),
    new UsersApi(SherlockConfiguration)
      .apiUsersV3Get({}, handleIAP(request))
      .then(
        (users) => users.sort(makeUserSorter(selfUserEmail)),
        errorResponseThrower,
      ),
    new RolesApi(SherlockConfiguration)
      .apiRolesV3Get({}, handleIAP(request))
      .catch(errorResponseThrower),
    preconfiguredLifecycle,
  ]);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  const offlineScheduleBeginTime = formData.get("offlineScheduleBeginTime");
  const offlineScheduleEndTime = formData.get("offlineScheduleEndTime");
  const offlineScheduleEndWeekends = formData.get("offlineScheduleEndWeekends");
  const environmentRequest: SherlockEnvironmentV3 = {
    ...formDataToObject(formData, true),
    autoPopulateChartReleases:
      formData.get("autoPopulateChartReleases") === "true",
    namePrefixesDomain: formData.get("namePrefixesDomain") === "true",
    preventDeletion: formData.get("preventDeletion") === "true",
    enableJanitor: formData.get("enableJanitor") === "true",
    offlineScheduleBeginEnabled:
      formData.get("offlineScheduleBeginEnabled") === "true",
    offlineScheduleBeginTime:
      offlineScheduleBeginTime && typeof offlineScheduleBeginTime === "string"
        ? dateWithCustomISOString(offlineScheduleBeginTime)
        : undefined,
    offlineScheduleEndEnabled:
      formData.get("offlineScheduleEndEnabled") === "true",
    offlineScheduleEndTime:
      offlineScheduleEndTime && typeof offlineScheduleEndTime === "string"
        ? dateWithCustomISOString(offlineScheduleEndTime)
        : undefined,
    offlineScheduleEndWeekends:
      typeof offlineScheduleEndWeekends === "string" &&
      offlineScheduleEndWeekends !== ""
        ? offlineScheduleEndWeekends === "true"
        : undefined,
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiEnvironmentsV3Post(
      { environment: environmentRequest },
      handleIAP(request),
    )
    .then(async (environment) => {
      if (
        environment.lifecycle === "dynamic" &&
        formData.get("action") !== "none"
      ) {
        await runGha(
          session,
          {
            workflow_id: ".github/workflows/bee-provision.yaml",
            inputs: {
              "bee-name": environment.name || "",
              "provision-only": (
                formData.get("action") === "provision"
              ).toString(),
            },
          },
          "provision your BEE",
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
  const [userEmail, clusters, users, roles, preconfiguredLifecycle] =
    useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  const { environments } = useEnvironmentsContext();

  const [lifecycle, setLifecycle] = useState(
    errorInfo?.formState?.lifecycle || preconfiguredLifecycle || "dynamic",
  );
  const [templateEnvironment, setTemplateEnvironment] = useState(
    errorInfo?.formState?.templateEnvironment || "",
  );
  const [defaultCluster, setDefaultCluster] = useState(
    errorInfo?.formState?.defaultCluster || "",
  );

  let potentialDuplicates = useMemo(
    () =>
      environments.filter(
        (environment) =>
          environment.lifecycle === "dynamic" &&
          environment.owner === userEmail &&
          environment.templateEnvironment === templateEnvironment,
      ),
    [userEmail, environments, templateEnvironment],
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
      <OutsetPanel alwaysShowScrollbar {...EnvironmentColors}>
        <ActionBox
          title="Now Creating New Environment"
          submitText="Click to Create"
          {...EnvironmentColors}
        >
          <EnvironmentCreatableFields
            setSidebar={setSidebar}
            setSidebarFilterText={setSidebarFilterText}
            environment={errorInfo?.formState}
            templateEnvironments={environments
              .filter((environment) => environment.lifecycle === "template")
              .sort(makeEnvironmentSorter("swatomation", null))}
            lifecycle={lifecycle}
            setLifecycle={setLifecycle}
            templateEnvironment={templateEnvironment}
            setTemplateEnvironment={setTemplateEnvironment}
          />
          {lifecycle === "dynamic" && (
            <>
              <p className="pt-4">
                <b>
                  By default, your BEE will shut down each night and you'll need
                  to come here to turn it on when you want to use it.
                </b>{" "}
                You can change this behavior below.
              </p>
              <details>
                <summary className="cursor-pointer">
                  Click to Show Scheduling Options
                </summary>
                <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col gap-4">
                  <EnvironmentScheduleFields
                    initialOfflineScheduleBeginEnabled={
                      errorInfo?.formState?.offlineScheduleBeginEnabled
                    }
                    initialOfflineScheduleBeginTime={
                      errorInfo?.formState?.offlineScheduleBeginTime
                    }
                    initialOfflineScheduleEndEnabled={
                      errorInfo?.formState?.offlineScheduleEndEnabled
                    }
                    initialOfflineScheduleEndTime={
                      errorInfo?.formState?.offlineScheduleEndTime
                    }
                    initialOfflineScheduleEndWeekends={
                      errorInfo?.formState?.offlineScheduleEndWeekends
                    }
                  />
                </div>
              </details>
            </>
          )}
          <p className="pt-4">
            There's a number of advanced configuration options that can impact
            how the{" "}
            {lifecycle === "dynamic"
              ? "BEE is deployed"
              : lifecycle === "template"
                ? "template works"
                : "environment behaves"}
            .{" "}
            {lifecycle !== "static" &&
              "These can usually be left alone unless you know the default behavior won't work for you."}
          </p>
          <details>
            <summary className="cursor-pointer">
              Click to Show Advanced Configuration
            </summary>
            <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col gap-4">
              {lifecycle === "dynamic" && (
                <>
                  <div>
                    <h2 className="font-light text-2xl text-color-header-text">
                      Action to Run
                    </h2>
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
                          it with some initial data. When the action is done,
                          the BEE will be started and ready to use.
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
                        not receive legacy FiaB-style seeding. When the action
                        is done, the BEE will be started and ready to use.
                      </p>
                    )}
                    {actionToRun === "none" && (
                      <p>
                        When creating, no GitHub Action will be kicked off.
                        Manual intervention will be required to bring the BEE
                        online, for example via "thelma bee provision." In other
                        words, not only will the BEE not be started, it won't
                        even exist in our infrastructure in the first place.
                      </p>
                    )}
                  </div>
                </>
              )}
              <EnvironmentAdvancedCreatableFields
                environment={errorInfo?.formState}
                lifecycle={lifecycle}
              />
              <p className="py-3 font-semibold">
                The fields below this point can be edited later
                {lifecycle === "dynamic" &&
                  " but some do have an initial impact during creation"}
                .
              </p>
              <EnvironmentEditableFields
                setSidebar={setSidebar}
                setSidebarFilterText={setSidebarFilterText}
                clusters={clusters}
                users={users}
                roles={roles}
                environment={errorInfo?.formState}
                creating={true}
                templateInUse={lifecycle === "dynamic"}
                defaultCluster={defaultCluster}
                setDefaultCluster={setDefaultCluster}
                selfEmail={userEmail}
              />
            </div>
          </details>
          {potentialDuplicates.length > 0 &&
            lifecycle === "dynamic" &&
            templateEnvironment && (
              <DuplicateBeeWarning
                template={templateEnvironment}
                matchingEnvironmentNames={potentialDuplicates.map(
                  (environment) => environment.name || "",
                )}
              />
            )}
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
