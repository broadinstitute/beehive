import {
  arrow,
  autoUpdate,
  flip,
  FloatingFocusManager,
  limitShift,
  offset,
  Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useRef } from "react";
import { ColorProps } from "~/features/color-class-names";

export const Popover: React.FunctionComponent<
  {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    openButton: (
      // The render prop should handle these arguments like `ref={ref} {...props()}`
      ref: React.Ref<HTMLDivElement>,
      props: ReturnType<typeof useInteractions>["getReferenceProps"]
    ) => React.ReactNode;
    initialPlacement?: Placement;
    children: React.ReactNode;
  } & ColorProps
> = ({
  open,
  onOpenChange,
  openButton,
  initialPlacement = "bottom",
  children,
  ...colors
}) => {
  // Floating UI's core job is to handle placement of the popover. This hook works by
  // giving us a bunch of props that we have to sprinkle around to make Floating UI's
  // math work out.
  //
  // Floating UI has its roots in Popper, an entire library dedicated just to tooltip
  // and popover placement. Floating UI helps out with interactivity and accessibility
  // too, but its documentation and types are lacking. The goal of this component is to
  // encapsulate usage of Floating UI so we don't need to worry about its quirks
  // elsewhere.
  const arrowElement = useRef<HTMLDivElement>(null);
  const {
    x,
    y,
    strategy,
    refs,
    context,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    open,
    onOpenChange,
    placement: initialPlacement,
    middleware: [
      offset(20),
      flip(),
      shift({
        padding: 10,
        limiter: limitShift(),
      }),
      arrow({ element: arrowElement, padding: 16 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // We want to offset the arrow closer to the reference, which means we need to know
  // its placement *relative to the popover*, since that's its parent. In other words,
  // we want the opposite placement of whatever the popover currently has relative
  // to the reference.
  const arrowSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]];

  // These hooks assemble a bunch of props for interactivity and accessibility. In theory,
  // the openButton shouldn't need to overtly control the popover as long as it can receive
  // these props.
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  // The use of z-axis and a pseudoelement here is to make the arrow and drop shadow work.
  //
  // 1. Popover          _ _ _ _ _ _ _ _
  //    z-20            /              /
  //                   /              /
  //                  /_ _ _ _ _ _ _ /
  //
  // 2. Arrow                          <>
  //    -z-10
  //
  // 3. Shadow         * * * * * * * * *
  //    -z-20         * * * * * * * * *
  //                 * * * * * * * * *
  //                * * * * * * * * *
  //
  // 4. Button                            _ _ _
  //                                     /    /
  //                                    /_ _ /
  //
  //
  // The key trick here is that the arrow is actually a rotated square. The popover overlaps
  // half of the square, so the only visible part looks like a triangle pointing towards the
  // button.
  // We don't want the popover's shadow visible on the arrow, though, so we put the shadow
  // instead on a pseudoelement beneath both the popover and arrow. Since the button at the
  // bottom is outside the popover's tree, it has no z-axis shenanigans and the shadow overlaps
  // it normally.
  return (
    // We return a fragment here so we can return both the button and the popover without
    // adding a div to the tree. The openButton might have flexbox grow or something that we
    // wouldn't want to smother by wrapping it.
    <>
      {openButton(refs.setReference, getReferenceProps)}
      {open && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            // The getProps functions returned by Floating UI accept some basic props that
            // they'll merge with their additions.
            {...getFloatingProps({ className: "z-20 w-max" })}
          >
            <div
              ref={arrowElement}
              style={{
                left: arrowX != undefined ? `${arrowX}px` : undefined,
                top: arrowY != undefined ? `${arrowY}px` : undefined,
                // This technique works because the arrow's offset just so happens to always
                // be on a side not used for actual positioning. E.g. When the popover is
                // on the bottom, `left` is used to align the arrow to the reference, so
                // we can safely `top: -10px`.
                ...(arrowSide ? { [arrowSide]: "-10px" } : {}),
              }}
              className={`absolute -z-10 w-5 h-5 rotate-45 ${colors.borderElementBackgroundClassName}`}
            />
            <div
              className={
                `flex flex-col gap-4 p-6 w-[80vw] laptop:w-[25vw] bg-color-nearest-bg rounded-2xl border-4 ${colors.borderClassName} ` +
                `before:block before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:-z-20 before:rounded-2xl before:shadow-2xl before:drop-shadow-xl`
              }
            >
              {children}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};
