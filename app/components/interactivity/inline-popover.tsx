import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverProps } from "./popover";

export const InlinePopover: React.FunctionComponent<
  {
    className: string;
    inlineText: string;
  } & Omit<PopoverProps, "openButton" | "open" | "onOpenChange">
> = ({ inlineText, className, ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      openButton={(ref, props) => (
        <button ref={ref} className="group relative" {...props()}>
          <span
            className={`${className} underline decoration-color-link-underline pr-2`}
          >
            {inlineText}
            {"\u00A0\u00A0\u00A0\u00A0"}
          </span>
          <ChevronRight
            className={`stroke-color-header-text absolute right-0 bottom-[5%] w-fit h-[90%] transition-transform ${
              open ? "rotate-90" : "group-hover:rotate-90 "
            }`}
          />
        </button>
      )}
      {...props}
    />
  );
};
