import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";
import { createContext } from "react";

export const SelfUserContext =
  createContext<SerializeFrom<V2controllersUser> | null>(null);
