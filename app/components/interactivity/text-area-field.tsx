import { forwardRef } from "react";

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
>((props, ref) => (
  <textarea
    className="w-full shadow-md rounded-2xl py-5 min-h-[3rem] border border-color-neutral-soft-border focus-visible:outline focus-visible:outline-color-focused-element focus-visible:invalid:outline-color-error-border pl-4 mt-2 bg-color-nearest-bg placeholder:text-color-placeholder-text invalid:border-dashed invalid:border-color-error-border"
    ref={ref}
    {...props}
  />
));
