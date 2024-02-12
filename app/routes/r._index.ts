import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

// Remix is kind enough to render any markdown files we leave
// laying around in the /routes diectory to actual routes, so
// this actually does work.
export function loader(_: LoaderFunctionArgs) {
  return redirect("/r/README");
}
