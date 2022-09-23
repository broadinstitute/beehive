import { LoaderFunction } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import {
  MiscApi,
  MiscMyUserResponse,
  MiscVersionResponse,
} from "@sherlock-js-client/sherlock";
import { FunctionComponent, version } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { DerivedErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  forwardIAP,
  SherlockConfiguration,
  errorResponseThrower,
  errorResponseReturner,
} from "~/helpers/sherlock.server";

export const handle = {
  breadcrumb: () => <NavLink to="/misc">Misc</NavLink>,
};

export const loader: LoaderFunction = async ({ request }) => {
  const api = new MiscApi(SherlockConfiguration);
  return [
    process.env.BUILD_VERSION || "development",
    await api
      .versionGet(forwardIAP(request))
      .then((versionResponse) => versionResponse, errorResponseReturner),
    await api
      .myUserGet(forwardIAP(request))
      .then((myUserResponse) => myUserResponse, errorResponseReturner),
  ];
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const MiscRoute: FunctionComponent = () => {
  const [beehiveVersion, sherlockVersion, mySherlockUser] =
    useLoaderData<
      [
        string,
        MiscVersionResponse | DerivedErrorInfo,
        MiscMyUserResponse | DerivedErrorInfo
      ]
    >();
  return (
    <div className="m-auto text-center">
      <p>
        Beehive version <span className="font-mono">{beehiveVersion}</span>
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
          <span className="font-mono">
            {" "}
            {(sherlockVersion as MiscVersionResponse).version}
          </span>{" "}
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
      )}
    </div>
  );
};

export default MiscRoute;
