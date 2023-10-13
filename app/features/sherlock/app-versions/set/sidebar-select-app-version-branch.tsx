import { SerializeFrom } from "@remix-run/node";
import { SherlockAppVersionV3 } from "@sherlock-js-client/sherlock";
import { useMemo } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { AppVersionColors } from "~/features/sherlock/app-versions/app-version-colors";

export const SidebarSelectAppVersionBranch: React.FunctionComponent<{
  appVersions: SerializeFrom<SherlockAppVersionV3[]>;
  fieldValue: string;
  setFieldValue: (value: string) => void;
}> = ({ appVersions, fieldValue, setFieldValue }) => {
  const chartName = appVersions[0]?.chart;
  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          appVersions
            .map((a) => a.gitBranch)
            .filter((value): value is string => typeof value === "string"),
        ),
      ),
    [appVersions],
  );
  return (
    <InteractiveList title="Recent Branches" {...AppVersionColors}>
      <MemoryFilteredList entries={branches}>
        {(branch, index) => (
          <ActionButton
            onClick={() => setFieldValue(branch)}
            isActive={branch === fieldValue}
            key={index.toString()}
            {...AppVersionColors}
          >
            <h2 className="font-light">
              {`${chartName} branch: `}
              <span className="font-medium">{branch}</span>
            </h2>
          </ActionButton>
        )}
      </MemoryFilteredList>
    </InteractiveList>
  );
};
