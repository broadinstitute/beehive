import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockServiceAlertV3Create,
  SherlockServiceAlertV3CreateSeverityEnum,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { ServiceAlertColors } from "../service-alert-colors";

export interface ServiceAlertCreatableFieldsProps {
  serviceAlert?:
    | SherlockServiceAlertV3Create
    | SerializeFrom<SherlockServiceAlertV3Create>;
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
> = ({ serviceAlert }) => {
  const [title, setTitle] = useState(serviceAlert?.title || "");
  const [message, setMessage] = useState(serviceAlert?.message || "");
  const [link, setLink] = useState(serviceAlert?.link || "");
  const [severity, setSeverity] = useState<string>(
    serviceAlert?.severity || " minor",
  );
  const [onEnvironment, setOnEnvironment] = useState(
    serviceAlert?.onEnvironment || "",
  );

  return (
    <div className="flex flex-col space-y-4">
      <label>
        <h2 className="font-light text-2xl text-color-header-text">Title</h2>
        <p>
          The title of the service alert that will be displayed prominently.
        </p>
        <TextField
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.currentTarget.value);
          }}
          required={true}
          placeholder="e.g., Scheduled Maintenance"
        />
      </label>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Message</h2>
        <p>The detailed message content explaining the service alert.</p>
        <textarea
          name="message"
          value={message}
          onChange={(e) => {
            setMessage(e.currentTarget.value);
          }}
          rows={4}
          className="w-full shadow-md rounded-2xl border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border p-4 mt-2 bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border resize-vertical"
          placeholder="Provide details about the service alert..."
        />
      </label>

      <div>
        <h2 className="font-light text-2xl text-color-header-text">Severity</h2>
        <p>
          The severity level of the service alert that determines its visual
          prominence.
        </p>
        <EnumInputSelect
          name="severity"
          className="grid grid-cols-3 mt-2"
          fieldValue={severity}
          setFieldValue={setSeverity}
          enums={[
            ["Minor", "minor"],
            ["Critical", "critical"],
            ["Blocker", "blocker"],
          ]}
          {...ServiceAlertColors}
        />
      </div>

      <div>
        <h2 className="font-light text-2xl text-color-header-text">
          Environment
        </h2>
        <p>
          The Terra environment where this alert should be displayed (optional).
        </p>
        <EnumInputSelect
          name="onEnvironment"
          className="grid grid-cols-3 mt-2"
          fieldValue={onEnvironment}
          setFieldValue={setOnEnvironment}
          enums={[
            ["Dev", "dev"],
            ["Staging", "staging"],
            ["Prod", "prod"],
          ]}
          {...ServiceAlertColors}
        />
      </div>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Link</h2>
        <p>
          Optional link for more information about the alert (e.g., status page,
          documentation).
        </p>
        <TextField
          name="link"
          value={link}
          onChange={(e) => {
            setLink(e.currentTarget.value);
          }}
          type="url"
          placeholder="https://..."
        />
      </label>
    </div>
  );
};
