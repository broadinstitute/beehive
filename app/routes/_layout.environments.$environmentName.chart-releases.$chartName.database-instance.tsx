import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
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
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { useEnvironmentChartReleaseContext } from "~/routes/_layout.environments.$environmentName.chart-releases.$chartName";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/environments/${params.environmentName}/chart-releases/${params.chartName}/database-instance`}
    >
      Database Metadata
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  {
    title: `${params.environmentName}/${params.chartName} - Chart Instance - Database Metadata`,
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiV2DatabaseInstancesSelectorGet(
      {
        selector: `chart-release/${params.environmentName}/${params.chartName}`,
      },
      handleIAP(request),
    )
    .catch(() => null);
}

export async function action({ request, params }: ActionFunctionArgs) {
  await getValidSession(request);

  const formData = await request.formData();
  const databaseInstanceRequest: V2controllersDatabaseInstance = {
    ...formDataToObject(formData, false),
  };

  return new DatabaseInstancesApi(SherlockConfiguration)
    .apiV2DatabaseInstancesSelectorPut(
      {
        databaseInstance: databaseInstanceRequest,
        selector: `chart-release/${params.environmentName}/${params.chartName}`,
      },
      handleIAP(request),
    )
    .then(
      () =>
        redirect(
          `/environments/${params.environmentName}/chart-releases/${params.chartName}`,
        ),
      makeErrorResponseReturner(databaseInstanceRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const { chartRelease } = useEnvironmentChartReleaseContext();
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
