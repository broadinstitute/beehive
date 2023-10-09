import type { SerializeFrom } from "@remix-run/node";
import type { SherlockSlackDeployHookV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { DeployHookColors } from "../deploy-hook-colors";

export const UncontrolledDeployHookConditionEditableFields: React.FunctionComponent<{
  existing?: SerializeFrom<SherlockSlackDeployHookV3>;
}> = ({ existing }) => {
  const [onSuccess, setOnSuccess] = useState<"true" | "false">(
    existing?.onSuccess === true ? "true" : "false",
  );
  const [onFailure, setOnFailure] = useState<"true" | "false">(
    existing?.onFailure === true ? "true" : "false",
  );
  return (
    <ControlledDeployHookConditionEditableFields
      onSuccess={onSuccess}
      setOnSuccess={setOnSuccess}
      onFailure={onFailure}
      setOnFailure={setOnFailure}
    />
  );
};

export const ControlledDeployHookConditionEditableFields: React.FunctionComponent<{
  onSuccess: "true" | "false";
  setOnSuccess: React.Dispatch<React.SetStateAction<"true" | "false">>;
  onFailure: "true" | "false";
  setOnFailure: React.Dispatch<React.SetStateAction<"true" | "false">>;
}> = ({ onSuccess, setOnSuccess, onFailure, setOnFailure }) => (
  <div>
    <h2 className="font-light text-2xl text-color-header-text">When to Run</h2>
    <EnumInputSelect<"true" | "false">
      name="onSuccess"
      className="grid grid-cols-2 mt-2"
      fieldValue={onSuccess}
      setFieldValue={setOnSuccess}
      enums={[
        ["Run on Success", "true"],
        ["Don't Run on Success", "false"],
      ]}
      {...DeployHookColors}
    />
    <EnumInputSelect<"true" | "false">
      name="onFailure"
      className="grid grid-cols-2 mt-4"
      fieldValue={onFailure}
      setFieldValue={setOnFailure}
      enums={[
        ["Run on Failure", "true"],
        ["Don't Run on Failure", "false"],
      ]}
      {...DeployHookColors}
    />
    <div className="pl-6 mt-4 border-l-2 border-color-divider-line flex gap-4 flex-col">
      {onSuccess === "true" && onFailure === "true"
        ? "This hook will run whether the deployment succeeds or fails."
        : onSuccess === "true" && onFailure === "false"
        ? "This hook will only run when the deployment succeeds."
        : onSuccess === "false" && onFailure === "true"
        ? "This hook will only run when the deployment fails."
        : "This hook will never run (neither successes nor failures will trigger it)."}
    </div>
  </div>
);
