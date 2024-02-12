import type { SerializeFrom } from "@remix-run/node";
import type { SherlockEnvironmentV3 } from "@sherlock-js-client/sherlock";

export const ListEnvironmentButtonText: React.FunctionComponent<{
  environment: SerializeFrom<SherlockEnvironmentV3>;
  extraText?: string;
}> = ({ environment, extraText }) => (
  <h2 className="font-light">
    {environment.lifecycle !== "dynamic" ? `${environment.lifecycle}: ` : ""}
    {environment.base} /{" "}
    <span className="font-medium">
      {environment.name}
      {extraText ? ` (${extraText})` : ""}
    </span>
  </h2>
);
