import { Octokit } from "@octokit/rest";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import {
  MiscApi,
  MiscMyUserResponse,
  MiscVersionResponse,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import {
  CsrfTokenContext,
  csrfTokenInputName,
} from "~/components/logic/csrf-token";
import { ThemeDropdown } from "~/components/logic/theme";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseReturner,
  forwardIAP,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession, sessionFields } from "~/session.server";

export const handle = {
  breadcrumb: () => <NavLink to="/misc">Misc</NavLink>,
};

export const meta: MetaFunction = () => ({
  title: "Misc",
});

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const sherlock = new MiscApi(SherlockConfiguration);
  const octokit = new Octokit({
    auth: session.get(sessionFields.githubAccessToken),
  });
  return [
    process.env.BUILD_VERSION || "development",
    await sherlock
      .versionGet(forwardIAP(request))
      .then((versionResponse) => versionResponse, errorResponseReturner),
    await sherlock
      .myUserGet(forwardIAP(request))
      .then((myUserResponse) => myUserResponse, errorResponseReturner),
    await octokit.users
      .getAuthenticated()
      .then((response) => response.data, errorResponseReturner),
  ];
};

const MiscRoute: FunctionComponent = () => {
  const [beehiveVersion, sherlockVersion, mySherlockUser, myGitHubUser] =
    useLoaderData<
      [
        // This loader has... particularly awful typing... because the
        // goal is to return as much as we can even if some requests error.
        // The semantics we can make good use of everywhere else pretty
        // much just fail here. This is one file, used just as a debugging
        // tool, so right now there's not much urgency to figure out some
        // more idiomatic mechanism here.
        // (If this seems fine, look below at all the type assertions we
        // need to do)
        string,
        MiscVersionResponse | DerivedErrorInfo,
        MiscMyUserResponse | DerivedErrorInfo,
        { login: string; html_url: string } | DerivedErrorInfo
      ]
    >();
  return (
    <div className="h-full text-color-body-text text-center flex flex-col justify-center items-center">
      <p>
        Beehive version{" "}
        <Link
          to={`/charts/beehive/app-versions/${beehiveVersion}`}
          className="font-mono underline decoration-color-link-underline"
        >
          {beehiveVersion}
        </Link>
      </p>
      {sherlockVersion.hasOwnProperty("title") ? (
        displayErrorInfo(sherlockVersion as DerivedErrorInfo)
      ) : (
        <p
          title={JSON.stringify(
            (sherlockVersion as MiscVersionResponse).buildInfo,
            null,
            2
          )}
        >
          Sherlock version{" "}
          <Link
            to={`/charts/sherlock/app-versions/${
              (sherlockVersion as MiscVersionResponse).version
            }`}
            className="font-mono underline decoration-color-link-underline"
          >
            {" "}
            {(sherlockVersion as MiscVersionResponse).version}
          </Link>{" "}
          built on{" "}
          <span className="font-mono">
            {" "}
            {(sherlockVersion as MiscVersionResponse).goVersion}
          </span>
        </p>
      )}
      <br />
      {mySherlockUser.hasOwnProperty("title") ? (
        displayErrorInfo(sherlockVersion as DerivedErrorInfo)
      ) : (
        <>
          <p
            title={JSON.stringify(
              (mySherlockUser as MiscMyUserResponse).rawInfo,
              null,
              2
            )}
          >
            You are{" "}
            <span className="font-mono">
              {" "}
              {(mySherlockUser as MiscMyUserResponse).email}
            </span>
            ; {(mySherlockUser as MiscMyUserResponse).suitability}
          </p>
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
        </>
      )}
      <br />
      {myGitHubUser.hasOwnProperty("title") ? (
        displayErrorInfo(myGitHubUser as DerivedErrorInfo)
      ) : (
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
};

export default MiscRoute;
