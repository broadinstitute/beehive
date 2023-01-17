import { forwardRef } from "react";

export const TextField = forwardRef<
  HTMLInputElement,
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
>((props, ref) => (
  <input
    type="text"
    className="w-full shadow-md rounded-2xl h-12 border border-color-text-box-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border pl-4 mt-2 bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border"
    ref={ref}
    {...props}
  />
));
