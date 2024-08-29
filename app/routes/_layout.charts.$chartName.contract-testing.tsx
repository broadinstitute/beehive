import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink } from "@remix-run/react";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { buildNotifications } from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";
import { commitSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/contract-testing`}>
      Contract Testing
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.chartName} - Chart - Contract Testing` },
];

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  if (!process.env.PACT_BASE_URL) {
    throw new Error("Beehive didn't have PACT_BASE_URL set");
  }
  if (!process.env.PACT_USERNAME) {
    throw new Error("Beehive didn't have PACT_USERNAME set");
  }
  if (!process.env.PACT_PASSWORD) {
    throw new Error("Beehive didn't have PACT_PASSWORD set");
  }

  // First, get the chart from Sherlock
  return await new ChartsApi(SherlockConfiguration)
    .apiChartsV3SelectorGet(
      {
        selector: params.chartName ?? "",
      },
      handleIAP(request),
    )
    .then(async (chart) => {
      if (!chart.appImageGitRepo || !chart.appImageGitRepo.includes("/")) {
        throw new Error(
          "The chart must have a GitHub repo configured for Pact to be enabled",
        );
      }
      if (!chart.appImageGitMainBranch) {
        throw new Error(
          "The chart must have a main branch configured for Pact to be enabled",
        );
      }
      // Second, add it to Pact as a "pacticipant" (not "participant", hello hour-of-debugging)
      return fetch(`${process.env.PACT_BASE_URL}/pacticipants`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "application/hal+json",
          Authorization: `Basic ${Buffer.from(
            process.env.PACT_USERNAME + ":" + process.env.PACT_PASSWORD,
          ).toString("base64")}`,
        }),
        body: JSON.stringify({
          name: chart.name,
          displayName: chart.name,
          repositoryUrl: `https://github.com/${chart.appImageGitRepo}`,
          mainBranch: chart.appImageGitMainBranch,
          repositoryName: chart.appImageGitRepo.split("/")[0],
          repositoryNamespace: chart.appImageGitRepo.split("/")[1],
        }),
      });
    }, errorResponseThrower)
    .then(async (response) => {
      if (response.status != 201) {
        throw new Error(
          `Could not successfully register ${params.chartName}: ${
            response.status
          }, ${await response.text()}`,
        );
      }
      // Third, tell Sherlock that Pact is enabled for this chart
      return new ChartsApi(SherlockConfiguration).apiChartsV3SelectorPatch(
        {
          selector: params.chartName || "",
          chart: { pactParticipant: true },
        },
        handleIAP(request),
      );
    }, errorResponseThrower)
    .then(async (chart) => {
      // Finally, show a notification to the user when we redirect
      session.flash(
        sessionFields.flashNotifications,
        buildNotifications({
          type: "contract-test",
          text: "To see it in Pact Broker",
          url: `${process.env.PACT_BASE_URL}/pacticipants/${chart.name}`,
        }),
      );
      return redirect(`/charts/${chart.name}`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }, errorResponseThrower);
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart } = useChartContext();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Contract Testing for ${chart.name}`}
          submitText="Enable Contract Testing"
          hideButton={
            chart.pactParticipant ||
            !chart.appImageGitRepo ||
            !chart.appImageGitMainBranch
          }
          {...ChartColors}
        >
          <h1 className="text-color-header-text text-3xl font-medium">
            Enable Contract Tests
          </h1>
          <p>
            Enabling contract testing allows the Pact Broker to know which
            contract versions are in each environment. This allows Pact to know
            whether a particular application version is safe to deploy. To learn
            more about contract testing, checkout the contract testing{" "}
            <a
              href="https://broadworkbench.atlassian.net/wiki/spaces/IRT/pages/2660368406/Getting+Started+with+Contract+Testing+and+Pact.ioc"
              target="_blank"
              className="underline decoration-color-link-underline w-fit"
              rel="noreferrer"
            >
              playbook
            </a>
            , or reach out to{" "}
            <a
              target="_blank"
              className="underline decoration-color-link-underline w-fit"
              rel="noreferrer"
              href="https://join.slack.com/share/enQtNTg2MzE2MjExMzM5OS0xZmMyMDQzM2RkMDgxOTZlYTI1OTA3YWYyYTUyZTA4MWU2OTM5ZmYxOWQ3MGRkMjgzM2ZmZWM3ZDhhZjc5NjQ5"
            >
              #dsp-contract-testing
            </a>
          </p>
          {chart.pactParticipant && "Contract testing is already enabled."}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
