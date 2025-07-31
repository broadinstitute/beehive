import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockServiceAlertV3Create,
  SherlockServiceAlertV3CreateSeverityEnum,
} from "@sherlock-js-client/sherlock";
import { Info } from "lucide-react";
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
    tooltip:
      "A minor function or feature is failing in rare or difficult to reproduce scenarios.",
  },
  {
    value: "critical",
    label: "Critical",
    tooltip:
      "A major functional component is not working as expected. A workaround is available.",
  },
  {
    value: "blocker",
    label: "Blocker",
    tooltip:
      "Major failure that affects the entire system or key modules of the system. This failure prevents clinical labs from providing CLIA certified results, or causes loss of data, money or both.",
  },
];

// Custom Severity Selector Component with Info Icon Tooltips
const SeveritySelector: React.FunctionComponent<{
  value: string;
  onChange: (value: string) => void;
  name: string;
  colors: any;
}> = ({ value, onChange, name, colors }) => {
  return (
    <div className="grid grid-cols-3 mt-2 gap-2">
      {severityOptions.map((option, index) => (
        <div key={option.value} className="relative">
          <label
            className={`
            flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer
            shadow-md hover:shadow-lg transition-all duration-200 relative
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

            {/* Info Icon */}
            <div className="group absolute top-2 right-2">
              <Info
                size={16}
                className="text-color-body-text hover:text-color-header-text transition-colors cursor-help"
              />

              {/* Dynamic Tooltip Positioning */}
              <div
                className={`absolute bottom-full mb-2 hidden group-hover:block z-50 ${
                  index === 0 ? "left-0" : "right-0"
                }`}
              >
                <div className="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-xl p-3 w-80">
                  <div className="text-sm text-left leading-relaxed">
                    {option.tooltip}
                  </div>
                  {/* Dynamic Tooltip Arrow */}
                  <div
                    className={`absolute top-full transform ${
                      index === 0 ? "left-4" : "right-4"
                    }`}
                  >
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </label>
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
