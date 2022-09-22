import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return "OK";
};
