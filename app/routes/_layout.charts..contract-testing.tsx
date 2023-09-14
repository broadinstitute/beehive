import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import { ChartsApi } from "@sherlock-js-client/sherlock";
import { OutsetFiller } from "~/components/layout/outset-filler";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { buildNotifications } from "~/components/logic/notification";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { ChartColors } from "~/features/sherlock/charts/chart-colors";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartContext } from "~/routes/_layout.charts.$chartName";
import { commitSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/charts/${params.chartName}/contractTesting`}>
      Contract Testing
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.chartName} - Chart - Contract Testing` },
];

export async function action({ request, params }: ActionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  const repo = formData.get("repo");
  const mainbranch = formData.get("mainbranch");
  if (typeof repo !== "string") {
    throw new Error(
      `Repo name must be of type 'string'. Instead it's ${typeof repo}`,
    );
  }
  if (typeof mainbranch !== "string") {
    throw new Error(
      `Git main branch name must be of type 'string'. Instead it's ${typeof mainbranch}`,
    );
  }
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/hal+json",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.PACTUSERNAME + ":" + process.env.PACTPASSWORD,
        ).toString("base64"),
    },
    body: JSON.stringify({
      name: params.chartName,
      displayName: params.chartName,
      repositoryUrl: "https://github.com/" + repo,
      mainBranch: mainbranch,
      repositoryName: repo,
    }),
  };
  return fetch(process.env.PACTBASEURL + "/pacticipants", requestOptions)
    .then((response) => {
      if (response.status != 201) {
        throw new Error(
          "Could not successfully register {params.chartName} to pact",
        );
      }
    })
    .then(() => {
      return new ChartsApi(SherlockConfiguration)
        .apiV2ChartsSelectorPatch(
          {
            selector: params.chartName || "",
            chart: { pactParticipant: true },
          },
          handleIAP(request),
        )
        .then(() =>
          session.flash(
            sessionFields.flashNotifications,
            buildNotifications({
              type: "contract-test",
              text: `To see it in Pact Broker`,
              url:
                process.env.PACTBASEURL + "/pacticipants/" + params.chartName,
            }),
          ),
        )
        .then(
          async () =>
            redirect(`/charts/${params.chartName || ""}`, {
              headers: {
                "Set-Cookie": await commitSession(session),
              },
            }),
          makeErrorResponseReturner(),
        );
    })
    .catch((reason) => {
      throw new Error(reason);
    });
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chart } = useChartContext();
  const errorInfo = useActionData<typeof action>();
  return (
    <>
      <OutsetPanel>
        <ActionBox
          title={`Contract Testing for ${chart.name}`}
          submitText={`Click to Enable Contract Testing`}
          hideButton={
            chart.pactParticipant ||
            !chart.appImageGitRepo ||
            !chart.appImageGitMainBranch
          }
          {...ChartColors}
        >
          <h1 className="text-color-header-text text-3xl font-medium">
            {" "}
            Enable Contract Tests{" "}
          </h1>
          <p>
            Enabling contract testing allows the Pact Broker to know which
            contract versions are in each environment. This allows Pact to know
            whether a particular application version is safe to deploy. To learn
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
          {chart.appImageGitRepo ? (
            <input
              type="hidden"
              name="repo"
              value={chart.appImageGitRepo}
            ></input>
          ) : (
            "The chart must have an app image git repo on it to enable contract testing. "
          )}
          {chart.appImageGitMainBranch ? (
            <input
              type="hidden"
              name="mainbranch"
              value={chart.appImageGitMainBranch}
            ></input>
          ) : (
            "The chart must have a git main branch for the app image to enable contract testing."
          )}
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <OutsetFiller />
    </>
  );
}
