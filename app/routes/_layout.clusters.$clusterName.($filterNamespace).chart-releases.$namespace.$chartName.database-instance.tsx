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
import { useClusterChartReleaseContext } from "~/routes/_layout.clusters.$clusterName.($filterNamespace).chart-releases.$namespace.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}/database-instance`}
    >
      Database Metadata
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.clusterName}/${params.namespace}/${params.chartName} - Chart Instance - Database Metadata`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiDatabaseInstancesV3SelectorGet(
      {
        selector: `chart-release/${params.clusterName}/${params.namespace}/${params.chartName}`,
      },
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
          `/clusters/${params.clusterName}/chart-releases/${params.namespace}/${params.chartName}`,
        ),
      makeErrorResponseReturner(databaseInstanceRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useClusterChartReleaseContext();
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
