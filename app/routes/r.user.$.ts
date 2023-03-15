import { LoaderArgs, redirect } from "@remix-run/node";
import { UsersApi } from "@sherlock-js-client/sherlock";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderArgs) {
  const search = params["*"] || "";
  if (search === "me") {
    return new UsersApi(SherlockConfiguration)
      .apiV2ProceduresUsersMeGet(forwardIAP(request))
      .then(
        (user) => redirect(`/users/${user.email}`),
        makeErrorResponseReturner()
      );
  } else {
    return new UsersApi(SherlockConfiguration)
      .apiV2UsersSelectorGet({ selector: search }, forwardIAP(request))
      .then(
        (user) => redirect(`/users/${user.email}`),
        () => redirect(`/users?search=${search.split("/").pop()}`)
      );
  }
}
