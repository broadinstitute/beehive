import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader(_: LoaderFunctionArgs) {
  return "OK";
}
