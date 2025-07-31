import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockServiceAlertV3Create,
  SherlockServiceAlertV3CreateSeverityEnum,
} from "@sherlock-js-client/sherlock";
import { useEffect, useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ProdWarning } from "~/features/sherlock/prod-warning";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { ServiceAlertColors } from "../service-alert-colors";

// Severity options with detailed tooltip descriptions
const severityOptions = [
  {
    value: "minor",
    label: "Minor",
    tooltip: ".",
  },
  {
    value: "critical",
    label: "Critical",
    tooltip: ".",
  },
  {
    value: "blocker",
    label: "Blocker",
    tooltip: ".",
  },
];

// Custom Severity Selector Component with Tooltips
const SeveritySelector: React.FunctionComponent<{
  value: string;
  onChange: (value: string) => void;
  name: string;
  colors: any;
}> = ({ value, onChange, name, colors }) => {
  return (
    <div className="grid grid-cols-3 mt-2 gap-2">
      {severityOptions.map((option) => (
        <div key={option.value} className="relative group">
          <label
            className={`
            flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer
            shadow-md hover:shadow-lg transition-all duration-200
            ${
              value === option.value
                ? `${colors.borderClassName} ${colors.backgroundClassName} border-4 font-medium`
                : "border-2 border-color-text-box-border bg-color-nearest-bg/50 hover:border-4"
            }
            focus-within:outline focus-within:outline-color-focused-element
          `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span className="text-color-header-text text-center">
              {option.label}
            </span>
          </label>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
            <div className="bg-color-body-bg border border-color-divider-line rounded-lg shadow-lg p-3 max-w-xs">
              <div className="text-sm text-color-body-text text-center">
                {option.tooltip}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="border-4 border-transparent border-t-color-body-bg"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export interface ServiceAlertCreatableFieldsProps {
  serviceAlert?:
    | SherlockServiceAlertV3Create
    | SerializeFrom<SherlockServiceAlertV3Create>;
  onEnvironmentChange?: (isProd: boolean) => void;
}

export const serviceAlertCreatableFormDataToObject = function (
  formData: FormData,
): SherlockServiceAlertV3Create {
  return {
    ...formDataToObject(formData, false),
    title: formData.get("title")?.toString(),
    message: formData.get("message")?.toString(),
    link: formData.get("link")?.toString(),
    severity: formData
      .get("severity")
      ?.toString() as SherlockServiceAlertV3CreateSeverityEnum,
    onEnvironment: formData.get("onEnvironment")?.toString(),
  };
};

export const ServiceAlertCreatableFields: React.FunctionComponent<
  ServiceAlertCreatableFieldsProps
> = ({ serviceAlert, onEnvironmentChange }) => {
  const [title, setTitle] = useState(serviceAlert?.title || "");
  const [message, setMessage] = useState(serviceAlert?.message || "");
  const [link, setLink] = useState(serviceAlert?.link || "");
  const [severity, setSeverity] = useState<string>(
    serviceAlert?.severity || "minor",
  );
  const [onEnvironment, setOnEnvironment] = useState(
    serviceAlert?.onEnvironment || "",
  );

  // Notify parent component when environment changes or on initial load
  useEffect(() => {
    onEnvironmentChange?.(onEnvironment === "prod");
  }, [onEnvironment, onEnvironmentChange]);

  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Title</h2>
        <p>
          The title of the service alert that will be displayed prominently.
        </p>
        <TextField
          name="title"
          value="Service Incident"
          onChange={(e) => {
            setTitle(e.currentTarget.value);
          }}
          required={true}
        />
      </label>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Message</h2>
        <p>The detailed message content explaining the service alert.</p>
        <textarea
          name="message"
          value="We are currently investigating an issue impacting the platform. More details will be provided as soon as possible."
          onChange={(e) => {
            setMessage(e.currentTarget.value);
          }}
          rows={4}
          className="w-full shadow-md rounded-2xl border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border p-4 mt-2 bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border resize-vertical"
          placeholder="We are currently investigating an issue impacting the platform. More details will be provided as soon as possible."
        />
      </label>

      <div>
        <h2 className="font-light text-2xl text-color-header-text">Severity</h2>
        <p>
          The severity level of the service alert that determines its visual
          prominence. Hover over each option for more details.
        </p>
        <SeveritySelector
          name="severity"
          value={severity}
          onChange={setSeverity}
          colors={ServiceAlertColors}
        />
      </div>

      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Environment
        </h2>
        <p>
          The Terra environment where this alert should be displayed (required).
        </p>
        <EnumInputSelect
          name="onEnvironment"
          className="grid grid-cols-3 mt-2"
          fieldValue={onEnvironment}
          setFieldValue={(value) => {
            setOnEnvironment(value);
            onEnvironmentChange?.(value === "prod");
          }}
          enums={[
            ["Dev", "dev"],
            ["Staging", "staging"],
            ["Prod", "prod"],
          ]}
          {...ServiceAlertColors}
        />
        {onEnvironment === "prod" && (
          <div className="mt-4">
            <ProdWarning name="service alerts" />
          </div>
        )}
      </div>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Link</h2>
        <p>
          Optional link for more information about the alert (e.g., status page,
          documentation).
        </p>
        <TextField
          name="link"
          value="https://support.terra.bio/hc/en-us/sections/4415104213787"
          onChange={(e) => {
            setLink(e.currentTarget.value);
          }}
          type="url"
          placeholder="https://support.terra.bio/hc/en-us/sections/4415104213787"
        />
      </label>
    </div>
  );
};
