import type { SerializeFrom } from "@remix-run/node";
import type { SherlockServiceAlertV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { ListServiceAlertButtonText } from "../list/list-service-alert-button-text";
import { matchServiceAlert } from "../list/match-service-alert";
import { ServiceAlertColors } from "../service-alert-colors";

export interface SidebarSelectServiceAlertProps {
  serviceAlerts: SerializeFrom<SherlockServiceAlertV3[]>;
  fieldValue: string;
  setFieldValue: (
    value: SerializeFrom<SherlockServiceAlertV3> | undefined,
  ) => void;
  title?: string;
}

export const SidebarSelectServiceAlert: React.FunctionComponent<
  SidebarSelectServiceAlertProps
> = ({
  serviceAlerts,
  fieldValue,
  setFieldValue,
  title = "Select Service Alert",
}) => (
  <SidebarFilterControlledList
    title={title}
    entries={serviceAlerts}
    filterText={fieldValue}
    filter={matchServiceAlert}
    handleListButtonClick={(entry) => setFieldValue(entry)}
    detectListButtonActive={(entry) =>
      entry.title === fieldValue ||
      entry.uuid === fieldValue ||
      entry.id?.toString() === fieldValue
    }
    listButtonTextFactory={(entry) => (
      <ListServiceAlertButtonText serviceAlert={entry} />
    )}
    {...ServiceAlertColors}
  />
);
