import { TextField } from "./text-field";

export interface DeletionGuardProps {
  name: string;
}

export const DeletionGuard: React.FunctionComponent<DeletionGuardProps> = ({
  name,
}) => (
  <label>
    Type "delete {name}" below to confirm:
    <TextField
      placeholder={`delete ${name}`}
      required
      pattern={`delete ${name}`}
    />
  </label>
);
