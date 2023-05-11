import {
  ActionArgs,
  LoaderArgs,
  redirect,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  NavLink,
  Params,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import {
  DatabaseInstancesApi,
  V2controllersDatabaseInstance,
} from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { DatabaseInstancePanel } from "~/features/sherlock/database-instances/database-instance-panel";
import {
  handleIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useChartChartReleaseContext } from "~/routes/_layout.charts.$chartName.chart-releases.$chartReleaseName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/charts/${params.chartName}/chart-releases/${params.chartReleaseName}/database-instance`}
    >
      Database Metadata
    </NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Database Metadata`,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiV2DatabaseInstancesSelectorGet(
      { selector: `chart-release/${params.chartReleaseName}` },
      handleIAP(request)
    )
    .catch(() => null);
}

export async function action({ request, params }: ActionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const databaseInstanceRequest: V2controllersDatabaseInstance = {
    ...formDataToObject(formData, false),
  };

  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiV2DatabaseInstancesSelectorPut(
      {
        databaseInstance: databaseInstanceRequest,
        selector: `chart-release/${params.chartReleaseName}`,
      },
      handleIAP(request)
    )
    .then(
      () =>
        redirect(
          `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`
        ),
      makeErrorResponseReturner(databaseInstanceRequest)
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useChartChartReleaseContext();
  const databaseInstance = useLoaderData<typeof loader>();
  const errorInfo = useActionData<typeof action>();
  return (
    <DatabaseInstancePanel
      chartRelease={chartRelease}
      databaseInstance={databaseInstance}
      errorInfo={errorInfo}
    />
  );
}
