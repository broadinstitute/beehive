import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ChangesetsSelectorGet(
      { selector: params["*"] || "" },
      handleIAP(request),
    )
    .then(
      (changeset) => redirect(`/review-changesets?changeset=${changeset.id}`),
      makeErrorResponseReturner(),
    );
}
