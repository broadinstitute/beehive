import { useFetcher } from "@remix-run/react";
import { Power, PowerOff } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import { CsrfTokenInput } from "~/components/logic/csrf-token";
import { EnvironmentColors } from "../environment-colors";

export const EnvironmentOfflineIcon: React.FunctionComponent<{
  environmentName: string;
  offline: boolean;
}> = ({ environmentName, offline }) => {
  const [open, onOpenChange] = useState(false);

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "done") {
      onOpenChange(false);
    }
  }, [fetcher.type]);

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <ActionButton
          sizeClassName="w-min py-1"
          type="button"
          ref={ref}
          isHovered={open}
          {...EnvironmentColors}
          {...props()}
        >
          {offline ? (
            <PowerOff className="w-9 h-9 stroke-color-header-text" />
          ) : (
            <Power className="w-9 h-9 stroke-color-header-text" />
          )}
        </ActionButton>
      )}
      {...EnvironmentColors}
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
            Starting a BEE will spin the services back up, reusing the same
            databases and configuration.
          </p>
        ) : (
          <p>
            Stopping a BEE saves database contents and environment configuration
            but spins down the services to save costs.
          </p>
        )}
        <input type="hidden" name="offline" value={(!offline).toString()} />
        <input type="hidden" name="environment" value={environmentName} />
        <ActionButton
          size="fill"
          type="submit"
          isLoading={fetcher.state !== "idle"}
          {...EnvironmentColors}
        >
          {`${offline ? "Start" : "Stop"} ${environmentName}`}
        </ActionButton>
        <CsrfTokenInput />
      </fetcher.Form>
      <p>
        If you want to delete a BEE, do it while the BEE is running so it can
        clean up cloud resources.
      </p>
    </Popover>
  );
};
