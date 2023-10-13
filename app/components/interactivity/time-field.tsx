import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { localZonedISOString } from "~/helpers/date";
import { LoadingField } from "./loading-field";

// This component accepts a date/string for an existing value and/or an initial 24-hr wall clock time,
// and allows customizing the time in the client's timezone. The value is written back out to the form
// as an ISO timestamp. In other words, the input and output are fully dated and timezoned timestamps,
// but the initial default value and the user interactions are in local time.
//
// Because it cares a lot about the user timezone, this component can't be server-side rendered, so a
// loading scaffold will be shown in its place very briefly just until React hydrates on the client.
export const TimeField: typeof InternalTimeField = (props) => (
  <ClientOnly fallback={<LoadingField />}>
    {() => <InternalTimeField {...props} />}
  </ClientOnly>
);

const InternalTimeField: React.FunctionComponent<
  Pick<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "name" | "required"
  > & {
    existingTime?: Date | string;
    initialInputTime?: string;
  }
> = ({ name, required, existingTime, initialInputTime }) => {
  const [date, setDate] = useState(
    existingTime
      ? new Date(existingTime)
      : initialInputTime
      ? inputTimeToDate(initialInputTime)
      : null,
  );
  return (
    <>
      <input
        type="time"
        pattern={inputTimeRegex.source} // unused by type="time" but if that's unsupported, the fallback is type="text" and this is better than nothing for the user
        onFocus={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch (_) {}
        }} // #useThePlatform (it's funny because I didn't know this existed for four hours)
        required={required}
        className="w-full pl-4 pr-2 mt-2 shadow-md rounded-2xl h-12 border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border"
        value={date ? dateToInputTime(date) : ""}
        onChange={(e) => setDate(inputTimeToDate(e.currentTarget.value))}
      />
      <input
        type="hidden"
        name={name}
        value={date ? localZonedISOString(date) : ""}
      />
    </>
  );
};

const inputTimeRegex = /(\d{1,2}):(\d{1,2})/;

function dateToInputTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function inputTimeToDate(inputTime: string): Date {
  const parsed = inputTime.match(inputTimeRegex);
  if (!parsed || parsed.length < 3) {
    throw new Error(
      `inputTime ${inputTime} didn't seem to successfully match against ${inputTimeRegex}, is something wrong with your browser's <input type="time" />?`,
    );
  }
  const date = new Date();
  date.setHours(parseInt(parsed[1]), parseInt(parsed[2]));
  return date;
}
