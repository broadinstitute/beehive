import type { SerializeFrom } from "@remix-run/node";
import type { SherlockAppVersionV3 } from "@sherlock-js-client/sherlock";
import { SidebarFilterControlledList } from "~/components/panel-structures/sidebar-filter-controlled-list";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";
import { ListAppVersionButtonText } from "../list/list-app-version-button-text";
import { matchAppVersion } from "../list/match-app-version";

export const SidebarSelectAppVersion: React.FunctionComponent<{
  appVersions: SerializeFrom<SherlockAppVersionV3[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
}> = ({ appVersions, fieldValue, setFieldValue }) => (
  <SidebarFilterControlledList
    title="Select App Version"
    entries={appVersions}
    filterText={fieldValue}
    filter={matchAppVersion}
    handleListButtonClick={(entry) => setFieldValue(entry.appVersion || "")}
    detectListButtonActive={(entry) => entry.appVersion === fieldValue}
    listButtonTextFactory={(entry) => (
      <ListAppVersionButtonText appVersion={entry} />
    )}
    {...AppVersionColors}
  />
);
