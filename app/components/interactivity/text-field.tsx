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
    className="w-full shadow-md rounded-2xl h-12 border border-zinc-400 focus-visible:outline-blue-500 focus-visible:invalid:outline-red-500 pl-[1vw] mt-2 bg-white placeholder:text-zinc-500 invalid:border-dashed invalid:border-red-500"
    ref={ref}
    {...props}
  />
));
