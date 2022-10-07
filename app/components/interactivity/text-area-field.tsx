import { forwardRef } from "react";

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
>((props, ref) => (
  <textarea
    className="w-full shadow-md rounded-2xl py-5 min-h-[3rem] border border-zinc-400 focus-visible:outline-blue-500 focus-visible:invalid:outline-red-500 pl-[1vw] mt-2 bg-white placeholder:text-zinc-500 invalid:border-dashed invalid:border-red-500"
    ref={ref}
    {...props}
  />
));
