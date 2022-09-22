import { forwardRef } from "react";

export interface TextFieldProps {
  name?: string | undefined;
  defaultValue?: string | undefined;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  pattern?: string | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ name, defaultValue, placeholder, required, pattern, onChange }, ref) => (
    <input
      type="text"
      className="w-full shadow-md rounded-2xl h-12 border border-zinc-400 focus-visible:outline-blue-500 pl-[1vw] mt-2 bg-white placeholder:text-zinc-500 invalid:border-dashed invalid:border-red-500"
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      onChange={onChange}
      ref={ref}
    />
  )
);
