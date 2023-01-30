import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { ColorProps } from "~/features/color-class-names";

export const IncidentTriggerSuccessPanel: React.FunctionComponent<
  Partial<ColorProps>
> = (props) => (
  <OutsetPanel {...props}>
    <ItemDetails title="Incident Triggered">
      <p>
        An incident has been triggered. You can follow-up with the on-call
        engineer in{" "}
        <a
          href="https://broadinstitute.slack.com/archives/CA1481PRN"
          target="_blank"
          className="underline decoration-color-link-underline"
        >
          #workbench-resilience in Slack
        </a>
        .
      </p>
    </ItemDetails>
  </OutsetPanel>
);
