import { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import LineNavButton from "~/components/common/line-nav-button";
import ViewPanel from "~/components/OLD panels/view";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
} from "~/helpers/sherlock.server";
import { toTitleCase } from "~/helpers/string";

export const handle = {
  breadcrumb: () => {
    const params = useParams();
    return (
      <NavLink to={`/environments/${params.environmentName}`}>
        {params.environmentName}
      </NavLink>
    );
  },
};

export const loader: LoaderFunction = async ({ request, params }) => {
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorGet(
      { selector: params.environmentName || "" },
      forwardIAP(request)
    )
    .catch(errorResponseThrower);
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const EnvironmentsEnvironmentNameRoute: FunctionComponent = () => {
  const environment: V2controllersEnvironment = useLoaderData();

  return (
    <div className="flex flex-row h-full grow">
      <ViewPanel
        title={environment.name}
        subtitle={`${toTitleCase(environment.lifecycle || "")} environment`}
        borderClassName="border-amber-300"
      >
        <LineNavButton
          to={`/environments/${environment.name}/chart-releases`}
          borderClassName="border-sky-300"
        >
          <h2 className="font-medium">View Charts in This Environment</h2>
        </LineNavButton>
        {environment.templateEnvironment && (
          <LineNavButton
            to={`/environments/${environment.templateEnvironment}`}
            borderClassName="border-amber-300"
          >
            <h2 className="font-medium">Jump to Template</h2>
          </LineNavButton>
        )}
        <div className="pt-4">
          <h2 className="text-2xl font-light">Helm Rendering</h2>
          <p>
            Charts in this environment are rendered from the{" "}
            <span className="font-mono">{environment.base}</span> values base in{" "}
            <a
              href="https://github.com/broadinstitute/terra-helmfile"
              className="decoration-blue-500 underline"
            >
              terra-helmfile
            </a>
            .
          </p>
          <p>
            This is a {environment.lifecycle} envirionment, so within the{" "}
            <span className="font-mono">{environment.base}</span> base, chart
            values are further derived from the{" "}
            {environment.lifecycle !== "dynamic" ? (
              "individual name of this environment."
            ) : (
              <span>
                <i>name of the template,</i>{" "}
                <Link
                  to={`/environments/${environment.templateEnvironment}`}
                  className="font-mono underline decoration-blue-500"
                >
                  {environment.templateEnvironment}
                </Link>
                .
              </span>
            )}
          </p>
        </div>
        <div className="pt-4">
          <h2 className="text-2xl font-light">Default Cluster</h2>
          {environment.defaultCluster ? (
            <p>
              Charts in this environment will deploy to the{" "}
              <Link
                to={`/clusters/${environment.defaultCluster}`}
                className="font-mono underline decoration-blue-500"
              >
                {environment.defaultCluster}
              </Link>{" "}
              Kubernetes cluster by default.
            </p>
          ) : (
            <p>
              Charts in this environment don't have a default Kubernetes
              cluster, so one would need to be set manually per-chart to deploy
              anything for real.
            </p>
          )}
          <p>
            Charts in this environment will deploy to a{" "}
            <span className="font-mono">{environment.defaultNamespace}</span>{" "}
            Kubernetes namespace by default.
          </p>
        </div>
        <div className="pt-4">
          <h2 className="text-2xl font-light">Access</h2>
          <p>This environment is maintained by {environment.owner}.</p>
          <p>
            This environment {environment.requiresSuitability ? "is" : "is not"}{" "}
            marked as requiring production suitability to modify.
          </p>
        </div>
        <h2 className="text-2xl font-light">Change {environment.name}</h2>
        <LineNavButton
          to={`/environments/${environment.name}/edit`}
          borderClassName="border-amber-300"
        >
          <h2 className="font-medium">Edit</h2>
        </LineNavButton>
        {(environment.lifecycle !== "static" && (
          <LineNavButton
            to={`/environments/${environment.name}/delete`}
            borderClassName="border-amber-300"
          >
            <h2 className="font-medium">Delete</h2>
          </LineNavButton>
        )) || <p>Static environments cannot be deleted here.</p>}
      </ViewPanel>
      <Outlet context={{ environment }} />
    </div>
  );
};

export default EnvironmentsEnvironmentNameRoute;
