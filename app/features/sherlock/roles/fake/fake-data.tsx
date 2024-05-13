import { SerializeFrom } from "@remix-run/node";
import {
  SherlockRoleV3,
  SherlockRoleV3FromJSON,
  SherlockRoleV3ToJSON,
} from "@sherlock-js-client/sherlock";

export const getFakeRoles = function () {
  return [
    SherlockRoleV3FromJSON({
      id: 1,
      name: "sherlock-super-admins",
      canBeGlassBrokenByRole: null,
      canBeGlassBrokenByRoleInfo: null,
      defaultGlassBreakDuration: null,
      grantsDevAzureGroup: "",
      grantsDevFirecloudGroup: "",
      grantsSherlockSuperAdmin: true,
      suspendNonSuitableUsers: true,
      createdAt: "2024-05-10T17:40:22.175Z",
      updatedAt: "2024-05-10T17:40:22.175Z",
    }),
    SherlockRoleV3FromJSON({
      id: 2,
      name: "terra-suitable-engineers",
      canBeGlassBrokenByRole: null,
      canBeGlassBrokenByRoleInfo: null,
      defaultGlassBreakDuration: null,
      grantsDevAzureGroup: "",
      grantsDevFirecloudGroup: "",
      grantsSherlockSuperAdmin: false,
      suspendNonSuitableUsers: true,
      createdAt: "2024-05-10T17:40:22.175Z",
      updatedAt: "2024-05-10T17:40:22.175Z",
    }),
    SherlockRoleV3FromJSON({
      id: 3,
      name: "terra-production-access",
      canBeGlassBrokenByRole: 2,
      canBeGlassBrokenByRoleInfo: {
        id: 2,
        name: "terra-suitable-engineers",
        /// ... TODO, meh
      },
      defaultGlassBreakDuration: null,
      grantsDevAzureGroup: "azure-prod-access-group",
      grantsDevFirecloudGroup: "fc-project-owners@firecloud.org",
      grantsSherlockSuperAdmin: false,
      suspendNonSuitableUsers: true,
      createdAt: "2024-05-10T17:40:22.175Z",
      updatedAt: "2024-05-10T17:40:22.175Z",
    }),
  ];
};

export const getFakeRoleByName = function (
  name: string,
): SerializeFrom<SherlockRoleV3> {
  const r = getFakeRoles().find((r) => r.name === name);
  if (r === undefined) {
    throw new Error("no such role: " + name);
  }
  return SherlockRoleV3ToJSON(r);
};

export const getFakeRoleById = function (
  id: number,
): SerializeFrom<SherlockRoleV3> {
  const r = getFakeRoles().find((r) => r.id === id);
  if (r === undefined) {
    throw new Error("no such role: " + id);
  }
  return SherlockRoleV3ToJSON(r);
};
