import { NavButton } from "~/components/interactivity/nav-button";
import { ColorProps } from "~/features/color-class-names";

export interface MutateControlsProps {
  name?: string;
  colors: ColorProps;
  toChangeVersions?: string;
  toChangeVersionsText?: string;
  changeVersionText?: string;
  toVersionHistory?: string;
  toEdit?: string;
  toSchedule?: string;
  toLinkPagerduty?: string;
  toAdjustBulkUpdateDefaults?: string;
  toDelete?: string;
}

export const MutateControls: React.FunctionComponent<MutateControlsProps> = ({
  name,
  colors,
  toChangeVersions,
  toChangeVersionsText = "Change Versions",
  changeVersionText,
  toVersionHistory,
  toEdit,
  toSchedule,
  toLinkPagerduty,
  toAdjustBulkUpdateDefaults,
  toDelete,
}) => (
  <div className="flex flex-col space-y-12">
    {(toChangeVersions || toVersionHistory) && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light text-color-header-text">
          On-Demand Deployment
        </h2>
        {toChangeVersions && (
          <>
            <NavButton to={toChangeVersions} {...colors}>
              {toChangeVersionsText}
            </NavButton>
            {changeVersionText && <p>{changeVersionText}</p>}
          </>
        )}
        {toVersionHistory && (
          <NavButton to={toVersionHistory} {...colors}>
            Version History
          </NavButton>
        )}
      </div>
    )}
    {(toEdit || toSchedule || toLinkPagerduty || toDelete) && (
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-light text-color-header-text">
          Make Changes
        </h2>
        {toEdit && (
          <NavButton to={toEdit} {...colors}>
            Edit Metadata
          </NavButton>
        )}
        {toSchedule && (
          <NavButton to={toSchedule} {...colors}>
            Change Stop and Start Schedule
          </NavButton>
        )}
        {toLinkPagerduty && (
          <NavButton to={toLinkPagerduty} {...colors}>
            Configure PagerDuty Link
          </NavButton>
        )}
        {toAdjustBulkUpdateDefaults && (
          <NavButton to={toAdjustBulkUpdateDefaults} {...colors}>
            Adjust Monolith / Bulk Update Defaults
          </NavButton>
        )}
        {toDelete && (
          <NavButton to={toDelete} {...colors}>
            Delete
          </NavButton>
        )}
      </div>
    )}
  </div>
);
