import { verifySessionCsrfToken } from "~/components/logic/csrf-token.server";
import { getSession } from "~/session.server";

export async function getValidSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);
  return session;
}
