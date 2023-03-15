import { SerializeFrom } from "@remix-run/node";
import { V2controllersUser } from "@sherlock-js-client/sherlock";
import { CopyableText } from "~/components/interactivity/copyable-text";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { MutateControls } from "../../mutate-controls";
import { UserColors } from "../user-colors";

export const UserDetails: React.FunctionComponent<{
  user: V2controllersUser | SerializeFrom<V2controllersUser>;
  isServiceAccount?: boolean;
  toEdit?: string;
}> = ({ user, isServiceAccount, toEdit }) => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl">Google Account</h2>
        <h1 className="font-light text-4xl">{user.email}</h1>
        <p>
          This information is sourced from Google-generated ID tokens from
          Sherlock's Identity-Aware Proxy.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>Login Email</div>
          <div className="break-words">
            <CopyableText>{user.email}</CopyableText>
          </div>
          <div>User ID</div>
          <div className="break-words">
            <CopyableText>{user.googleID}</CopyableText>
          </div>
          <div>User ID (without namespace prefix)</div>
          <div className="break-words">
            <CopyableText>{user.googleID?.split(":").pop()}</CopyableText>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {user.githubUsername ? (
          <>
            <h2 className="font-light text-2xl">GitHub Account</h2>
            <h1 className="font-light text-4xl">{user.githubUsername}</h1>
            <p>
              This information is sourced from the GitHub access the user grants
              Beehive upon sign-in.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>Login Username</div>
              <div className="break-words">
                <CopyableText>{user.githubUsername}</CopyableText>
              </div>
              <div>User ID</div>
              <div className="break-words">
                <CopyableText>{user.githubID}</CopyableText>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-light text-2xl">No Linked GitHub Account</h2>
            {isServiceAccount ? (
              <p>
                Service accounts won't generally have a linked GitHub account.
              </p>
            ) : (
              <p>
                GitHub account linking will automatically occur if user signs
                into Beehive.
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl">Metadata</h2>
        <p>
          This information is derived from Beehive and Sherlock. It isn't used
          for security or permissions.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>Name / Username</div>
          <div className="break-words">
            {user.name ? <CopyableText>{user.name}</CopyableText> : "(None)"}
          </div>
          <div>Create Time (first connection to Sherlock above v0.1.16)</div>
          <div>
            <PrettyPrintTime time={user.createdAt} />
          </div>
          <div>Update Time (last change to user record)</div>
          <div>
            <PrettyPrintTime time={user.updatedAt} />
          </div>
        </div>
      </div>
      {toEdit && <MutateControls colors={UserColors} toEdit={toEdit} />}
    </div>
  );
};
