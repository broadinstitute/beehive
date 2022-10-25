import { ActionFunction, json } from "@remix-run/node";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { destroySession, getSession } from "~/session.server";

// Note that while this logs out from Beehive's perspective,
// from the user's perspective it basically won't. The user
// sees *IAP's* cookie being cleared as presenting them with
// a meaningful login screen, while for its own cookie Beehive
// can usually re-authorize the user with GitHub just with
// no-interact redirects.
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);
  return json({}, { headers: { "Set-Cookie": await destroySession(session) } });
};
