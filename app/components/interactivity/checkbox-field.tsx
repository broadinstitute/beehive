export interface CheckboxFieldProps {
  name?: string | undefined;
  defaultChecked: boolean | undefined;
}

export const CheckboxField: React.FunctionComponent<CheckboxFieldProps> = ({
  name,
  defaultChecked,
}) => (
  <input
    type="checkbox"
    className="w-4 h-4"
    name={name}
    defaultChecked={defaultChecked}
    value="true"
  />
);
