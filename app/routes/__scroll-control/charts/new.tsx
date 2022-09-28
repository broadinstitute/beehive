import { ActionFunction, redirect } from "@remix-run/node";
import { NavLink, Outlet, useActionData, useParams } from "@remix-run/react";
import { ChartsApi, V2controllersChart } from "@sherlock-js-client/sherlock";
import { verifyAuthenticityToken } from "remix-utils";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  ChartColors,
  ChartCreatableFields,
  ChartEditableFields,
} from "~/components/content/chart";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FillerText } from "~/components/panel-structures/filler-text";
import { Branch } from "~/components/route-tree/branch";
import { Leaf } from "~/components/route-tree/leaf";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/sessions.server";

export const handle = {
  breadcrumb: () => <NavLink to={`/charts/new`}>New</NavLink>,
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifyAuthenticityToken(request, session);

  const formData = await request.formData();
  const chartRequest: V2controllersChart = {
    ...formDataToObject(formData, true),
    chartExposesEndpoint: formData.get("chartExposesEndpoint") === "true",
    defaultPort: ((defaultPort) =>
      typeof defaultPort === "string" && defaultPort !== ""
        ? parseInt(defaultPort)
        : undefined)(formData.get("defaultPort")),
  };

  return new ChartsApi(SherlockConfiguration)
    .apiV2ChartsPost({ chart: chartRequest }, forwardIAP(request))
    .then(
      (chart) => redirect(`/charts/${chart.name}`),
      makeErrorResponserReturner(chartRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const NewRoute: React.FunctionComponent = () => {
  const actionData = useActionData<ActionErrorInfo<V2controllersChart>>();
  return (
    <Branch>
      <OutsetPanel {...ChartColors}>
        <ActionBox
          title="Now Creating New Chart"
          submitText="Click to Create"
          {...ChartColors}
        >
          <ChartCreatableFields chart={actionData?.faultyRequest} />
          <p className="py-4">Fields below this point can be edited later.</p>
          <ChartEditableFields chart={actionData?.faultyRequest} />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      <Leaf>
        <InsetPanel>
          <FillerText>
            <p>
              Creating a new chart here lets us track and (attempt) deployments
              of it. It doesn't create the chart files itself.
            </p>
            <p>
              The chart repo needs to be one recognized by DevOps's systems
              (Thelma, specifically). Contact us if you're trying to deploy
              something external.
            </p>
          </FillerText>
        </InsetPanel>
      </Leaf>
    </Branch>
  );
};

export default NewRoute;
