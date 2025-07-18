import type { SerializeFrom } from "@remix-run/node";
import type {
  SherlockServiceAlertV3EditableFields,
  SherlockServiceAlertV3EditableFieldsSeverityEnum,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { ProdWarning } from "~/features/sherlock/prod-warning";
import { formDataToObject } from "~/helpers/form-data-to-object";
import { ServiceAlertColors } from "../service-alert-colors";

export interface ServiceAlertEditableFieldsProps {
  serviceAlert?:
    | SherlockServiceAlertV3EditableFields
    | SerializeFrom<SherlockServiceAlertV3EditableFields>;
  showEnvironmentWarning?: boolean;
}

export const serviceAlertEditableFormDataToObject = function (
  formData: FormData,
): SherlockServiceAlertV3EditableFields {
  return {
    ...formDataToObject(formData, false),
    title: formData.get("title")?.toString(),
    message: formData.get("message")?.toString(),
    link: formData.get("link")?.toString(),
    severity: formData
      .get("severity")
      ?.toString() as SherlockServiceAlertV3EditableFieldsSeverityEnum,
  };
};

export const ServiceAlertEditableFields: React.FunctionComponent<
  ServiceAlertEditableFieldsProps
> = ({ serviceAlert, showEnvironmentWarning = false }) => {
  const [title, setTitle] = useState(serviceAlert?.title || "");
  const [message, setMessage] = useState(serviceAlert?.message || "");
  const [link, setLink] = useState(serviceAlert?.link || "");
  const [severity, setSeverity] = useState<string>(
    serviceAlert?.severity || "minor",
  );

  return (
    <div className="flex flex-col space-y-4">
      {showEnvironmentWarning && <ProdWarning name="service alerts" />}

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Title</h2>
        <p>The title of the service alert.</p>
        <TextField
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.currentTarget.value);
          }}
          required={true}
        />
      </label>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Message</h2>
        <p>The main message content of the service alert.</p>
        <textarea
          name="message"
          value={message}
          onChange={(e) => {
            setMessage(e.currentTarget.value);
          }}
          rows={4}
          className="w-full shadow-md rounded-2xl border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border p-4 mt-2 bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border resize-vertical"
        />
      </label>

      <label>
        <h2 className="font-light text-2xl text-color-header-text">Link</h2>
        <p>Optional link for more information about the alert.</p>
        <TextField
          name="link"
          value={link}
          onChange={(e) => {
            setLink(e.currentTarget.value);
          }}
          type="url"
          placeholder=""
        />
      </label>

      <div>
        <h2 className="font-light text-2xl text-color-header-text">Severity</h2>
        <p>The severity level of the service alert.</p>
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
    </div>
  );
};
