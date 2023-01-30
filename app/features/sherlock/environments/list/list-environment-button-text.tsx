import { SerializeFrom } from "@remix-run/node";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";

export const ListEnvironmentButtonText: React.FunctionComponent<{
  environment: SerializeFrom<V2controllersEnvironment>;
}> = ({ environment }) => (
  <h2 className="font-light">
    {environment.lifecycle !== "dynamic" ? `${environment.lifecycle}: ` : ""}
    {environment.base} / <span className="font-medium">{environment.name}</span>
  </h2>
);
