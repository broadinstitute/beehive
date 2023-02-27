import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TimeField } from "~/components/interactivity/time-field";
import { EnvironmentColors } from "../environment-colors";

export const EnvironmentScheduleFields: React.FunctionComponent<{
  initialOfflineScheduleBeginEnabled?: boolean;
  initialOfflineScheduleBeginTime?: Date | string;
  initialOfflineScheduleEndEnabled?: boolean;
  initialOfflineScheduleEndTime?: Date | string;
  initialOfflineScheduleEndWeekends?: boolean;
}> = ({
  initialOfflineScheduleBeginEnabled,
  initialOfflineScheduleBeginTime,
  initialOfflineScheduleEndEnabled,
  initialOfflineScheduleEndTime,
  initialOfflineScheduleEndWeekends,
}) => {
  const [offlineScheduleBeginEnabled, setOfflineScheduleBeginEnabled] =
    useState(
      initialOfflineScheduleBeginEnabled != null
        ? initialOfflineScheduleBeginEnabled.toString()
        : "true"
    );
  const [offlineScheduleEndEnabled, setOfflineScheduleEndEnabled] = useState(
    initialOfflineScheduleEndEnabled != null
      ? initialOfflineScheduleEndEnabled.toString()
      : "true"
  );
  const [offlineScheduleEndWeekends, setOfflineScheduleEndWeekends] = useState(
    initialOfflineScheduleEndWeekends != null
      ? initialOfflineScheduleEndWeekends.toString()
      : "false"
  );
  return (
    <>
      <div>
        <h2 className="font-light text-2xl">Stop Schedule</h2>
        <EnumInputSelect
          name="offlineScheduleBeginEnabled"
          className="grid grid-cols-2 mt-2"
          fieldValue={offlineScheduleBeginEnabled}
          setFieldValue={setOfflineScheduleBeginEnabled}
          enums={[
            ["Enabled", "true"],
            ["Disabled", "false"],
          ]}
          {...EnvironmentColors}
        />
      </div>
      {offlineScheduleBeginEnabled === "true" && (
        <div className="pl-6 border-l-2 border-color-divider-line flex flex-col gap-4">
          <div>
            <h2 className="font-light text-2xl">
              When Should the BEE Stop Each Day?
            </h2>
            <p className="mt-1">
              The time is represented in your current timezone.
            </p>
            <TimeField
              required
              name="offlineScheduleBeginTime"
              existingTime={initialOfflineScheduleBeginTime}
              initialInputTime="19:00"
            />
          </div>
        </div>
      )}
      <div>
        <h2 className="font-light text-2xl">Start Schedule</h2>
        <EnumInputSelect
          name="offlineScheduleEndEnabled"
          className="grid grid-cols-2 mt-2"
          fieldValue={offlineScheduleEndEnabled}
          setFieldValue={setOfflineScheduleEndEnabled}
          enums={[
            ["Enabled", "true"],
            ["Disabled", "false"],
          ]}
          {...EnvironmentColors}
        />
      </div>
      {offlineScheduleEndEnabled === "true" && (
        <div className="pl-6 border-l-2 border-color-divider-line flex flex-col gap-4">
          <div>
            <h2 className="font-light text-2xl">
              When Should the BEE Start Each Day?
            </h2>
            <p className="mt-1">
              The time is represented in your current timezone.
            </p>
            <p className="mt-1">
              Heads up that BEEs can take a few minutes to start.
            </p>
            <TimeField
              required
              name="offlineScheduleEndTime"
              existingTime={initialOfflineScheduleEndTime}
              initialInputTime="07:00"
            />
          </div>
          <div>
            <h2 className="font-light text-2xl">
              Should the BEE Start on Weekends?
            </h2>
            <p className="mt-1">
              You can let your BEE sleep through the day on Saturday and Sunday.
              You can start it up manually if you need
              {offlineScheduleBeginEnabled === "true" &&
                " and it'll be stopped again at the normal time that night"}
              .
            </p>
            <EnumInputSelect
              name="offlineScheduleEndWeekends"
              className="grid grid-cols-2 mt-2"
              fieldValue={offlineScheduleEndWeekends}
              setFieldValue={setOfflineScheduleEndWeekends}
              enums={[
                ["Start on Weekends", "true"],
                ["Don't Start on Weekends", "false"],
              ]}
              {...EnvironmentColors}
            />
          </div>
        </div>
      )}
    </>
  );
};
