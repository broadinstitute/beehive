import type { SerializeFrom } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import type {
  SherlockRoleV3,
  SherlockUserV3,
} from "@sherlock-js-client/sherlock";
import React, { useContext, useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { Popover } from "~/components/interactivity/popover";
import { CsrfTokenInput } from "~/components/logic/csrf-token";
import { SelfUserContext } from "~/contexts";
import { RoleColors } from "../roles/role-colors";
import type { getProdAccessConfig } from "./prod-access-widget.server";

type ProdAccessStatus =
  | "suspended-admin-assignment"
  | "temporary-admin-assignment"
  | "permanent-admin-assignment"
  | "suspended-suitable-assignment"
  | "suitable-assignment"
  | "no-assignment";

function deriveProdAccessStatus(
  user: SerializeFrom<SherlockUserV3> | null,
  config: ReturnType<typeof getProdAccessConfig>,
): ProdAccessStatus {
  const adminAssignment = user?.assignments?.find(
    (assignment) =>
      (assignment?.roleInfo as SherlockRoleV3)?.name ===
      config.adminTerraEngineerRole,
  );

  if (adminAssignment) {
    if (adminAssignment.suspended) {
      return "suspended-admin-assignment";
    } else if (adminAssignment.expiresIn) {
      return "temporary-admin-assignment";
    } else {
      return "permanent-admin-assignment";
    }
  }

  const suitableAssignment = user?.assignments?.find(
    (assignment) =>
      (assignment?.roleInfo as SherlockRoleV3)?.name ===
      config.suitableTerraEngineerRole,
  );

  if (suitableAssignment) {
    if (suitableAssignment.suspended) {
      return "suspended-suitable-assignment";
    } else {
      return "suitable-assignment";
    }
  }

  return "no-assignment";
}

const expiresInRegex = /\d*h?\d*m?/;

export const ProdAccessWidget: React.FunctionComponent<{
  config: ReturnType<typeof getProdAccessConfig>;
}> = ({ config }) => {
  const user = useContext(SelfUserContext);
  const [open, onOpenChange] = useState(false);

  const status = deriveProdAccessStatus(user, config);
  const expiresIn =
    status === "temporary-admin-assignment"
      ? user?.assignments
          ?.find(
            (assignment) =>
              (assignment?.roleInfo as SherlockRoleV3)?.name ===
              config.adminTerraEngineerRole,
          )
          ?.expiresIn?.match(expiresInRegex)?.[0] || "a few seconds"
      : null;

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      openButton={(ref, props) => (
        <div className="m-4 tablet:m-8">
          <ActionButton
            type="button"
            ref={ref}
            isHovered={open}
            sizeClassName="w-80 h-36"
            {...RoleColors}
            {...props()}
          >
            <div className="flex flex-col justify-center items-center text-center w-72">
              <div className="border-b border-color-divider-line/80 border-solid w-full">
                <h2 className="text-3xl font-light">Prod Admin</h2>
              </div>
              <div>
                <p className="font-normal text-base">
                  <ProdAccessSummary status={status} expiresIn={expiresIn} />
                </p>
              </div>
            </div>
          </ActionButton>
        </div>
      )}
      initialPlacement="left"
      size="one-third"
      {...RoleColors}
    >
      <ProdAccessPopoverContents
        status={status}
        config={config}
        expiresIn={expiresIn}
      />
    </Popover>
  );
};

const ProdAccessSummary: React.FunctionComponent<{
  status: ProdAccessStatus;
  expiresIn: string | null;
}> = ({ status, expiresIn }) => {
  switch (status) {
    case "temporary-admin-assignment":
      return <>Active for {expiresIn}</>;
    case "suitable-assignment":
      return <>Available: Click for Access</>;
    case "suspended-admin-assignment":
      return <>Unavailable: Click for Details</>;
    case "permanent-admin-assignment":
      return <>Permanently Active</>;
    case "suspended-suitable-assignment":
      return <>Unavailable: Click for Details</>;
    case "no-assignment":
      return <>Unavailable: Click for Details</>;
  }
};

const ProdAccessPopoverContents: React.FunctionComponent<{
  status: ProdAccessStatus;
  config: ReturnType<typeof getProdAccessConfig>;
  expiresIn: string | null;
}> = ({ status, config, expiresIn }) => {
  const transition = useNavigation();
  const [clickedButton, setClickedButton] = useState<string>();
  switch (status) {
    case "temporary-admin-assignment":
      return (
        <>
          <Form
            className={`flex flex-col gap-4 rounded-2xl p-6 border-2 ${RoleColors.borderClassName} ${RoleColors.backgroundClassName}`}
            method="post"
          >
            <p>
              You currently have temporary admin-level access to Terra
              production. It'll expire in about {expiresIn}. Click below to
              extend it.
            </p>
            <input type="hidden" name="type" value="prod-access" />
            <input type="hidden" name="action" value="refresh" />
            <ActionButton
              size="fill"
              type="submit"
              onClick={() => setClickedButton("refresh")}
              isLoading={
                transition.state === "submitting" && clickedButton === "refresh"
              }
              {...RoleColors}
            >
              Reset Prod Admin Expiry
            </ActionButton>
            <CsrfTokenInput />
          </Form>
          <Form
            className={`flex flex-col gap-4 rounded-2xl p-6 border-2 ${RoleColors.borderClassName} ${RoleColors.backgroundClassName}`}
            method="post"
          >
            <p>
              If you're done with your admin access, you can revoke it early.
            </p>
            <input type="hidden" name="type" value="prod-access" />
            <input type="hidden" name="action" value="revoke" />
            <ActionButton
              size="fill"
              type="submit"
              onClick={() => setClickedButton("revoke")}
              isLoading={
                transition.state === "submitting" && clickedButton === "revoke"
              }
              {...RoleColors}
            >
              End Prod Admin Session
            </ActionButton>
            <CsrfTokenInput />
          </Form>
        </>
      );
    case "suitable-assignment":
      return (
        <Form
          className={`flex flex-col gap-4 rounded-2xl p-6 border-2 ${RoleColors.borderClassName} ${RoleColors.backgroundClassName}`}
          method="post"
        >
          <p>
            You're suitable and have baseline access to Terra production. Click
            below to temporarily elevate your permissions to admin-level.
          </p>
          <input type="hidden" name="type" value="prod-access" />
          <input type="hidden" name="action" value="create" />
          <ActionButton
            size="fill"
            type="submit"
            onClick={() => setClickedButton("create")}
            isLoading={
              transition.state === "submitting" && clickedButton === "create"
            }
            {...RoleColors}
          >
            Get Prod Admin
          </ActionButton>
          <CsrfTokenInput />
        </Form>
      );
    case "suspended-admin-assignment":
      return (
        <>
          Your assignment to {config.adminTerraEngineerRole} has been suspended.
          This likely means our systems have marked you as
          non-production-suitable. Please reach out to DevOps for help.
        </>
      );
    case "permanent-admin-assignment":
      return (
        <>
          You've been granted permanent access to{" "}
          {config.adminTerraEngineerRole}. You don't need to "break-glass" with
          Beehive.
        </>
      );
    case "suspended-suitable-assignment":
      return (
        <>
          <p>
            Your assignment to {config.suitableTerraEngineerRole} has been
            suspended. This likely means our systems have marked you as
            non-production-suitable. Please reach out to DevOps for help.
          </p>
          <p>
            You need to be in {config.suitableTerraEngineerRole} to
            "break-glass" into the {config.adminTerraEngineerRole} role with
            Beehive.
          </p>
        </>
      );
    case "no-assignment":
      return (
        <>
          <p>
            You have no assignment to {config.suitableTerraEngineerRole}, which
            is required to edit production or "break-glass" into the{" "}
            {config.adminTerraEngineerRole} role with Beehive.
          </p>
          <p>
            If you think you should have access to production, please reach out
            to DevOps for help.
          </p>
        </>
      );
  }
};
