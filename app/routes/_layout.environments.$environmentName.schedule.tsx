import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  ActionArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/server-runtime";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { Power, PowerOff } from "lucide-react";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { EnvironmentScheduleFields } from "~/features/sherlock/environments/offline/environment-schedule-fields";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { wrapForZonedISOString } from "~/helpers/date";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useEnvironmentContext } from "./_layout.environments.$environmentName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/schedule`}>
      Schedule
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.environmentName} - Environment - Schedule` },
];

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const offlineScheduleBeginTime = formData.get("offlineScheduleBeginTime");
  const offlineScheduleEndTime = formData.get("offlineScheduleEndTime");
  const offlineScheduleEndWeekends = formData.get("offlineScheduleEndWeekends");

  const environmentRequest: V2controllersEnvironment = {
    offlineScheduleBeginEnabled:
      formData.get("offlineScheduleBeginEnabled") === "true",
    offlineScheduleBeginTime:
      offlineScheduleBeginTime && typeof offlineScheduleBeginTime === "string"
        ? wrapForZonedISOString(new Date(offlineScheduleBeginTime))
        : undefined,
    offlineScheduleEndEnabled:
      formData.get("offlineScheduleEndEnabled") === "true",
    offlineScheduleEndTime:
      offlineScheduleEndTime && typeof offlineScheduleEndTime === "string"
        ? wrapForZonedISOString(new Date(offlineScheduleEndTime))
        : undefined,
    offlineScheduleEndWeekends:
      typeof offlineScheduleEndWeekends === "string" &&
      offlineScheduleEndWeekends !== ""
        ? offlineScheduleEndWeekends === "true"
        : undefined,
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
  const { environment } = useEnvironmentContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Adjusting Schedule for ${environment.name}`}
          submitText="Click to Apply"
          {...EnvironmentColors}
        >
          <p>
            BEEs cost money to run. To save money, we can stop them when they're
            not in use. Configuration and database contents all get saved and
            will be there when the BEE is started back up.
          </p>
          <details>
            <summary className="cursor-pointer">
              Click to Show Technical Info
            </summary>
            <div className="pl-6 border-l-2 border-color-divider-line mt-4 flex flex-col gap-4">
              <p>
                This works by setting all replica counts to zero, so no
                application Docker containers are running. It's like shutting
                down your computer: CPU and RAM usage goes down to zero but
                storage and settings stick around.
              </p>
              <p>
                In other words, this basically works like how legacy FiaBs had
                start and stop behavior that just turned the backing VM on and
                off. BEEs use Kubernetes, so our cluster will autoscale up and
                down to accomodate the number of currently running BEEs.
              </p>
            </div>
          </details>
          <p>
            You can always manually control whether a BEE is stopped or started
            through Beehive by clicking the{" "}
            <Power className="inline-block align-text-bottom" size={18} /> or{" "}
            <PowerOff className="inline-block align-text-bottom" size={18} />{" "}
            power icon shown next to a BEE's name.
          </p>
          <EnvironmentScheduleFields
            initialOfflineScheduleBeginEnabled={
              errorInfo?.formState?.offlineScheduleBeginEnabled ||
              environment.offlineScheduleBeginEnabled ||
              false
            }
            initialOfflineScheduleBeginTime={
              errorInfo?.formState?.offlineScheduleBeginTime ||
              environment.offlineScheduleBeginTime
            }
            initialOfflineScheduleEndEnabled={
              errorInfo?.formState?.offlineScheduleEndEnabled ||
              environment.offlineScheduleEndEnabled ||
              false
            }
            initialOfflineScheduleEndTime={
              errorInfo?.formState?.offlineScheduleEndTime ||
              environment.offlineScheduleEndTime
            }
            initialOfflineScheduleEndWeekends={
              errorInfo?.formState?.offlineScheduleEndWeekends ||
              environment.offlineScheduleEndWeekends
            }
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
