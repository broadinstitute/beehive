import { LoaderArgs } from "@remix-run/node";

export async function loader(_: LoaderArgs) {
  return "OK";
}
