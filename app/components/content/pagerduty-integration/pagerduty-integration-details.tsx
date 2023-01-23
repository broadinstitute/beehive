import { SerializeFrom } from "@remix-run/node";
import { V2controllersPagerdutyIntegration } from "@sherlock-js-client/sherlock";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { MutateControls, ProdWarning } from "../helpers";
import { PagerdutyIntegrationColors } from "./pagerduty-integration-colors";

export interface PagerdutyIntegrationDetailsProps {
  pagerdutyIntegration:
    | V2controllersPagerdutyIntegration
    | SerializeFrom<V2controllersPagerdutyIntegration>;
  toDelete?: string;
}

export const PagerdutyIntegrationDetails: React.FunctionComponent<
  PagerdutyIntegrationDetailsProps
> = ({ pagerdutyIntegration, toDelete }) => (
  <div className="flex flex-col space-y-10">
    <ProdWarning name={pagerdutyIntegration.name || ""} />
    <p>
      This integration is for {pagerdutyIntegration.type}{" "}
      {pagerdutyIntegration.name} that has ID {pagerdutyIntegration.pagerdutyID}
      .
    </p>
    <p>
      The integration key itself is hidden inside Sherlock, it can't be read
      back out through the API. It'll get updated if you re-link from PagerDuty.
    </p>
    <p>
      This integration was last updated in Sherlock's database at{" "}
      <PrettyPrintTime time={pagerdutyIntegration.updatedAt} />.
    </p>
    {toDelete && (
      <MutateControls
        name={pagerdutyIntegration.name || ""}
        colors={PagerdutyIntegrationColors}
        toDelete={toDelete}
      />
    )}
  </div>
);
