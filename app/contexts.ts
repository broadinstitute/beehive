import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { createContext } from "react";

export const SelfUserContext =
  createContext<SerializeFrom<SherlockUserV3> | null>(null);
