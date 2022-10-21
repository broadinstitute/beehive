import { LoaderFunction, redirect } from "@remix-run/node";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  return new ChangesetsApi(SherlockConfiguration)
    .apiV2ChangesetsSelectorGet(
      { selector: params["*"] || "" },
      forwardIAP(request)
    )
    .then(
      (changeset) => redirect(`/review-changesets?changeset=${changeset.id}`),
      errorResponseReturner
    );
};
