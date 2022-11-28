import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

export interface EnvironmentDeleteDescriptionProps {
  environment: V2controllersEnvironment;
}

export const EnvironmentDeleteDescription: React.FunctionComponent<
  EnvironmentDeleteDescriptionProps
> = ({ environment }) => (
  <div className="flex flex-col space-y-4">
    <h2 className="text-2xl font-light">
      Are you sure you want to delete this {environment.lifecycle} environment?
    </h2>
    {environment.lifecycle === "dynamic" && (
      <p>
        Since this environment is dynamic, that will cause it to become
        unrendered by Thelma, meaning that the entire deployment will get wiped
        from our infrastructure.
      </p>
    )}
    {environment.lifecycle === "template" && (
      <p>
        Since this environment is a template, any BEEs based on it will continue
        functioning but no new ones will be able to be created.
      </p>
    )}
    {environment.lifecycle === "static" && (
      <p>
        Since this environment is static, all Kubernetes resources will cease
        being rendered by Thelma. There are protections in place that will
        prevent immediate deletion, and Terraform resources like databases will
        be unaffected. You should contact DevOps before proceeding.
      </p>
    )}
    <p>
      This will not delete any associated configuration from our Helm values in{" "}
      <a
        href="https://github.com/broadinstitute/terra-helmfile"
        className="decoration-color-link-underline underline"
      >
        terra-helmfile
      </a>
      .
    </p>
    <p>
      After deletion, the name of the environment will remain reserved in
      Sherlock forever. You will not be able to create a new environment with
      the same name.
    </p>
  </div>
);
