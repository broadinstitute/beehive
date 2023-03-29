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
          <div className="absolute inset-y-0 right-0 aspect-square">
            <ChevronRight
              className={`stroke-color-header-text h-full w-full transition-transform ${
                open ? "rotate-90" : "group-hover:rotate-90"
              }`}
            />
          </div>
        </button>
      )}
      {...props}
    />
  );
};
