import { ActionFunctionArgs, json } from "@remix-run/node";
import { destroySession } from "~/session.server";
import { getValidSession } from "../helpers/get-valid-session.server";

// Note that while this logs out from Beehive's perspective,
// from the user's perspective it basically won't. The user
// sees *IAP's* cookie being cleared as presenting them with
// a meaningful login screen, while for its own cookie Beehive
// can usually re-authorize the user with GitHub just with
// no-interact redirects.
export async function action({ request }: ActionFunctionArgs) {
  const session = await getValidSession(request);
  return json({}, { headers: { "Set-Cookie": await destroySession(session) } });
}
