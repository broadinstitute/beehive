import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData, useLoaderData } from "@remix-run/react";
import type { SherlockDatabaseInstanceV3 } from "@sherlock-js-client/sherlock";
import { DatabaseInstancesApi } from "@sherlock-js-client/sherlock";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import { DatabaseInstancePanel } from "~/features/sherlock/database-instances/database-instance-panel";
import {
  SherlockConfiguration,
  handleIAP,
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

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.chartReleaseName} - Chart Instance - Database Metadata`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiDatabaseInstancesV3SelectorGet(
      { selector: `chart-release/${params.chartReleaseName}` },
      handleIAP(request),
    )
    .catch(() => null);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const databaseInstanceRequest: SherlockDatabaseInstanceV3 = {
    ...formDataToObject(formData, false),
  };

  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiDatabaseInstancesV3Put(
      {
        databaseInstance: databaseInstanceRequest,
      },
      handleIAP(request),
    )
    .then(
      () =>
        redirect(
          `/charts/${params.chartName}/chart-releases/${params.chartReleaseName}`,
        ),
      makeErrorResponseReturner(databaseInstanceRequest),
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
