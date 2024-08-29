import type { Session } from "@remix-run/node";
import { sessionFields } from "~/session.server";
import { csrfTokenInputName } from "./csrf-token";

export const verifySessionCsrfToken = async (
  request: Request,
  session: Session,
) => {
  if (request.bodyUsed) {
    throw new Error(
      "Request body consumed before validating CSRF token - this indicates a Beehive source code issue",
    );
  }
  if (!session.has(sessionFields.csrfToken)) {
    throw new Error(
      "Session did not contain a CSRF token - this indicates an issue on Beehive's end setting the cookie",
    );
  }
  const formData = await request.clone().formData();
  if (!formData.get(csrfTokenInputName)) {
    throw new Error(
      "Request body did not contain a CSRF token - this indicates an issue on Beehive's end constructing the form",
    );
  }
  if (
    formData.get(csrfTokenInputName) !== session.get(sessionFields.csrfToken)
  ) {
    throw new Response(
      "CSRF protection tripped; token in cookie was inconsistent with token in the form",
      { status: 422 },
    );
  }
};
