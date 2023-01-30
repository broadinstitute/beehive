import { LoaderArgs, redirect } from "@remix-run/node";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ChangesetsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (changeset) => redirect(`/review-changesets?changeset=${changeset.id}`),
      makeErrorResponseReturner()
    );
}
