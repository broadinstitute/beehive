import { Octokit } from "@octokit/rest";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, Link, NavLink, useLoaderData } from "@remix-run/react";
import { MiscApi, UsersApi } from "@sherlock-js-client/sherlock";
import { Suspense } from "react";
import {
  CsrfTokenContext,
  csrfTokenInputName,
} from "~/components/logic/csrf-token";
import { ThemeDropdown } from "~/components/logic/theme";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/misc">Misc</NavLink>,
};

export const meta: MetaFunction = () => [
  {
    title: "Misc",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const sherlock = new MiscApi(SherlockConfiguration);
  const sherlockUsers = new UsersApi(SherlockConfiguration);
  const octokit = new Octokit({
    auth: session.get(sessionFields.githubAccessToken),
  });
  return defer({
    beehiveVersion: process.env.BUILD_VERSION || "development",
    sherlockVersionPromise: sherlock
      .versionGet(handleIAP(request))
      .then((versionResponse) => versionResponse),
    mySherlockUserPromise: sherlockUsers.apiUsersV3SelectorGet(
      { selector: "self" },
      handleIAP(request),
    ),
    myGitHubUserPromise: octokit.users
      .getAuthenticated()
      .then((response) => response.data),
  });
}

export default function Route() {
  const {
    beehiveVersion,
    sherlockVersionPromise,
    mySherlockUserPromise,
    myGitHubUserPromise,
  } = useLoaderData<typeof loader>();

  return (
    <div className="h-full w-full text-color-body-text text-center flex flex-col justify-center items-center">
      <p>
        Beehive version{" "}
        <Link
          to={`/charts/beehive/app-versions/${beehiveVersion}`}
          className="font-mono underline decoration-color-link-underline"
        >
          {beehiveVersion}
        </Link>
      </p>

      <Suspense fallback={<p>Loading Sherlock version...</p>}>
        <Await
          resolve={sherlockVersionPromise}
          errorElement={<p>Error loading Sherlock version!</p>}
        >
          {(sherlockVersion) => (
            <p title={JSON.stringify(sherlockVersion.buildInfo, null, 2)}>
              Sherlock version{" "}
              <Link
                to={`/charts/sherlock/app-versions/${sherlockVersion.version}`}
                className="font-mono underline decoration-color-link-underline"
              >
                {" "}
                {sherlockVersion.version}
              </Link>{" "}
              built on{" "}
              <span className="font-mono"> {sherlockVersion.goVersion}</span>
            </p>
          )}
        </Await>
      </Suspense>
      <br />

      <Suspense fallback={<p>Loading Sherlock user info...</p>}>
        <Await
          resolve={mySherlockUserPromise}
          errorElement={<p>Error loading Sherlock user info!</p>}
        >
          {(mySherlockUser) => (
            <p>
              You are <span className="font-mono"> {mySherlockUser.email}</span>
              .{" "}
              {mySherlockUser.suitable
                ? "You are currently suitable."
                : "You are not currently suitable."}
            </p>
          )}
        </Await>
      </Suspense>
      <p>
        Click{" "}
        <a
          href="?gcp-iap-mode=CLEAR_LOGIN_COOKIE"
          className="decoration-color-link-underline underline"
        >
          here
        </a>{" "}
        to log out by forcibly invalidating your IAP cookie (usually
        unnecessary)
      </p>
      <br />

      <Suspense fallback={<p>Loading GitHub user info...</p>}>
        <Await
          resolve={myGitHubUserPromise}
          errorElement={<p>Error loading GitHub user info!</p>}
        >
          {(myGitHubUser) => (
            <p title={JSON.stringify(myGitHubUser, null, 2)}>
              You are{" "}
              <a
                href={(myGitHubUser as { html_url: string }).html_url}
                className="font-mono underline decoration-color-link-underline"
              >
                {(myGitHubUser as { login: string }).login}
              </a>{" "}
              on GitHub
            </p>
          )}
        </Await>
      </Suspense>
      <CsrfTokenContext.Consumer>
        {(token) => (
          <p>
            Click{" "}
            <button
              className="decoration-color-link-underline underline"
              onClick={async () => {
                // We don't want fancy form-submitting server-side
                // behavior here: our goal is to get the client to
                // receive a cookie-wiping response header. We
                // fudge the form just so that we can fit in the
                // CSRF token.
                const formData = new FormData();
                formData.append(csrfTokenInputName, token);
                await fetch("/logout", {
                  body: formData,
                  method: "post",
                });
                // Next, we want to go back home. We don't want to
                // do any sort of client-side routing here, because
                // we *want* to run the whole loader sequence. We
                // just change the page location to force a hard-
                // enough refresh.
                window.location.href = window.location.origin;
              }}
            >
              here
            </button>{" "}
            to forcibly revalidate your Beehive cookie (usually unnecessary)
          </p>
        )}
      </CsrfTokenContext.Consumer>
      <br />

      <ThemeDropdown />
    </div>
  );
}
