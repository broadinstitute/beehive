import { useState } from "react";
import { TextField } from "./text-field";

export interface DeletionGuardProps {
  name?: string;
}

export const DeletionGuard: React.FunctionComponent<DeletionGuardProps> = ({
  name,
}) => {
  const [userTriedPasting, setUserTriedPasting] = useState(false);
  return (
    <label>
      <p>Type "delete {name || "this"}" below to confirm:</p>
      <TextField
        placeholder={
          userTriedPasting
            ? `are you sure? (pasting now allowed)`
            : `delete ${name || "this"}`
        }
        required
        pattern={`delete ${name || "this"}`}
        onPasteCapture={
          userTriedPasting
            ? undefined
            : (e) => {
                setUserTriedPasting(true);
                e.preventDefault();
                e.stopPropagation();
              }
        }
      />
    </label>
  );
};
