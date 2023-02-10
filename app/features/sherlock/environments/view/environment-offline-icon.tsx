import {
  arrow,
  autoUpdate,
  flip,
  FloatingFocusManager,
  limitShift,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useFetcher } from "@remix-run/react";
import { Power, PowerOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { CsrfTokenInput } from "~/components/logic/csrf-token";
import { EnvironmentColors } from "../environment-colors";

export const EnvironmentOfflineIcon: React.FunctionComponent<{
  environmentName: string;
  offline: boolean;
}> = ({ environmentName, offline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const arrowElement = useRef<HTMLDivElement>(null);
  const {
    x,
    y,
    strategy,
    refs,
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    placement,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
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
  const arrowSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[placement.split("-")[0]];
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "done") {
      setIsOpen(false);
    }
  }, [fetcher.type]);
  return (
    <>
      <ActionButton
        sizeClassName="w-min py-1"
        type="button"
        ref={refs.setReference}
        isHovered={isOpen}
        {...EnvironmentColors}
        {...getReferenceProps()}
      >
        {offline ? (
          <PowerOff className="w-9 h-9 stroke-color-header-text" />
        ) : (
          <Power className="w-9 h-9 stroke-color-header-text" />
        )}
      </ActionButton>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            className="z-20 w-max"
            {...getFloatingProps()}
          >
            <div
              ref={arrowElement}
              style={{
                left: arrowX != undefined ? `${arrowX}px` : undefined,
                top: arrowY != undefined ? `${arrowY}px` : undefined,
                ...(arrowSide ? { [arrowSide]: "-10px" } : {}),
              }}
              className={`absolute -z-10 w-5 h-5 rotate-45 ${EnvironmentColors.borderElementBackgroundClassName}`}
            ></div>
            <div
              className={`flex flex-col  gap-4 p-6 w-[80vw] lg:w-[25vw] bg-color-nearest-bg rounded-2xl border-4 ${EnvironmentColors.borderClassName} before:block before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:-z-20 before:rounded-2xl before:shadow-2xl lbefore:drop-shadow-xl`}
            >
              <h3 className="font-light text-3xl">{`Currently ${
                offline ? "Stopped" : "Running"
              }`}</h3>
              <fetcher.Form
                className={`flex flex-col gap-4 rounded-2xl p-6 border-2 ${EnvironmentColors.borderClassName} ${EnvironmentColors.backgroundClassName}`}
                method="post"
                action="/api/sherlock/set-environment-offline"
              >
                {offline ? (
                  <p>
                    Starting a BEE will spin the services back up, reusing the
                    same databases and configuration.
                  </p>
                ) : (
                  <p>
                    Stopping a BEE saves database contents and environment
                    configuration but spins down the services to save costs.
                  </p>
                )}
                <input
                  type="hidden"
                  name="offline"
                  value={(!offline).toString()}
                />
                <input
                  type="hidden"
                  name="environment"
                  value={environmentName}
                />
                <ActionButton
                  sizeClassName="w-full"
                  type="submit"
                  isLoading={fetcher.state !== "idle"}
                  {...EnvironmentColors}
                >
                  {`${offline ? "Start" : "Stop"} ${environmentName}`}
                </ActionButton>
                <CsrfTokenInput />
              </fetcher.Form>
              <p>
                If you want to delete a BEE, do it while the BEE is running so
                it can clean up cloud resources.
              </p>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};
