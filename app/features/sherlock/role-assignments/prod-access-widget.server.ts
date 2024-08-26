import { redirect } from "@remix-run/node";
import { RoleAssignmentsApi, RolesApi } from "@sherlock-js-client/sherlock";
import { env } from "process";
import type { Notification } from "~/components/logic/notification";
import { buildNotifications } from "~/components/logic/notification";
import { getUserEmail } from "~/helpers/get-user-email.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession, sessionFields } from "~/session.server";
import { handleIAP, SherlockConfiguration } from "../sherlock.server";

export function getProdAccessConfig() {
  return {
    suitableTerraEngineerRole:
      env.SHERLOCK_TERRA_ENGINEER_SUITABLE_ROLE || "terra-engineer-suitable",
    adminTerraEngineerRole:
      env.SHERLOCK_TERRA_ENGINEER_ADMIN_ROLE || "terra-engineer-admin",
  };
}

export async function handleProdAccessRequest(request: Request) {
  const session = await getValidSession(request);
  const email = getUserEmail(request);
  const config = getProdAccessConfig();
  const formData = await request.formData();

  if (formData.get("type") !== "prod-access") {
    throw new Error(
      "Invalid form type, something in Beehive is unimplemented!",
    );
  }

  const action = formData.get("action");
  let notification: Notification;
  switch (action) {
    case "revoke":
      notification = await new RoleAssignmentsApi(SherlockConfiguration)
        .apiRoleAssignmentsV3RoleSelectorUserSelectorDelete(
          {
            roleSelector: config.adminTerraEngineerRole,
            userSelector: email,
          },
          handleIAP(request),
        )
        .then(
          (): Notification => ({
            type: "info",
            text: "Your prod admin access has been revoked.",
          }),
          (rejected): Notification => ({
            type: "error",
            text: `Your request was rejected: ${JSON.stringify(rejected)}`,
            error: true,
          }),
        );
      break;
    case "refresh":
      notification = await new RolesApi(SherlockConfiguration)
        .apiRolesV3SelectorGet(
          { selector: config.adminTerraEngineerRole },
          handleIAP(request),
        )
        .then((role) =>
          new RoleAssignmentsApi(
            SherlockConfiguration,
          ).apiRoleAssignmentsV3RoleSelectorUserSelectorPatch(
            {
              roleSelector: config.adminTerraEngineerRole,
              userSelector: email,
              roleAssignment: { expiresIn: role.defaultGlassBreakDuration },
            },
            handleIAP(request),
          ),
        )
        .then(
          (): Notification => ({
            type: "info",
            text: "Your access extension was accepted.",
          }),
          (rejected): Notification => ({
            type: "error",
            text: `Your request was rejected: ${JSON.stringify(rejected)}`,
            error: true,
          }),
        );
      break;
    case "create":
      notification = await new RolesApi(SherlockConfiguration)
        .apiRolesV3SelectorGet(
          { selector: config.adminTerraEngineerRole },
          handleIAP(request),
        )
        .then((role) =>
          new RoleAssignmentsApi(
            SherlockConfiguration,
          ).apiRoleAssignmentsV3RoleSelectorUserSelectorPost(
            {
              roleSelector: config.adminTerraEngineerRole,
              userSelector: email,
              roleAssignment: { expiresIn: role.defaultGlassBreakDuration },
            },
            handleIAP(request),
          ),
        )
        .then(
          (): Notification => ({
            type: "info",
            text: "Your request was accepted, cloud propagation may take several minutes.",
          }),
          (rejected): Notification => ({
            type: "error",
            text: `Your request was rejected: ${JSON.stringify(rejected)}`,
            error: true,
          }),
        );
      break;
    default:
      throw new Error("Invalid action type, something in Beehive is broken!");
  }
  session.flash(
    sessionFields.flashNotifications,
    buildNotifications(notification),
  );
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
