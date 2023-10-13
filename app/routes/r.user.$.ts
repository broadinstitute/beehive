import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { UsersApi } from "@sherlock-js-client/sherlock";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const search = params["*"] || "";
  return new UsersApi(SherlockConfiguration)
    .apiUsersV3SelectorGet({ selector: search }, handleIAP(request))
    .then(
      (user) => redirect(`/users/${user.email}`),
      () => redirect(`/users?search=${search.split("/").pop()}`),
    );
}
