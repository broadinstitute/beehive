import type { SerializeFrom } from "@remix-run/node";
import type { SherlockUserV3 } from "@sherlock-js-client/sherlock";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { CopyableText } from "~/components/interactivity/copyable-text";
import { ExternalNavButton } from "~/components/interactivity/external-nav-button";
import { PrettyPrintTime } from "~/components/logic/pretty-print-time";
import { MutateControls } from "../../mutate-controls";
import { UserColors } from "../user-colors";

export const UserDetails: React.FunctionComponent<{
  user: SherlockUserV3 | SerializeFrom<SherlockUserV3>;
  isServiceAccount?: boolean;
  toEdit?: string;
  slackWorkspaceID?: string;
}> = ({ user, isServiceAccount, toEdit, slackWorkspaceID }) => {
  return (
    <div className="flex flex-col gap-10">
      {user.slackID && slackWorkspaceID && (
        <ExternalNavButton
          icon={
            <img
              src="https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png"
              className="h-[1.75rem]"
              alt="Slack"
            />
          }
          to={`slack://user?team=${slackWorkspaceID}&id=${user.slackID}`}
          beforeBorderClassName="before:border-[#36C5F0]"
          target="_blank"
        >
          <h2>Slack Message ↗</h2>
        </ExternalNavButton>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl text-color-header-text">Security</h2>
        <div className="flex flex-row gap-2">
          {user.suitable ? (
            <>
              <BadgeCheck className="stroke-color-status-green shrink-0 h-12 w-12" />
              <p>
                <b className="font-strong">This user is production-suitable</b>{" "}
                according to our platform. That means they can directly access
                and impact production.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="stroke-color-status-yellow shrink-0 h-12 w-12" />
              <div>
                <p className="pb-2">
                  <b className="font-strong">
                    This user currently lacks production suitability
                  </b>{" "}
                  according to our platform. That means they'll likely be
                  prevented from directly accessing or impacting production.
                </p>
                <p>
                  If the user isn't suitable at all, they potentially shouldn't
                  be allowed to view sensitive data. Feel free to ask DevOps or
                  InfoSec for clarification.
                </p>
              </div>
            </>
          )}
        </div>
        {!user.suitable && (
          <>
            <p className="pt-4">
              In case it's helpful for debugging, here's Sherlock's automatic
              assessment of the user's suitability:
            </p>
            <p>"{user.suitabilityDescription}"</p>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl text-color-header-text">
          Google Identity
        </h2>
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
            <h2 className="font-light text-2xl text-color-header-text">
              GitHub Identity
            </h2>
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
            <h2 className="font-light text-2xl text-color-header-text">
              No Linked GitHub Identity
            </h2>
            {isServiceAccount ? (
              <p>
                Service accounts won't generally have a linked GitHub account.
              </p>
            ) : (
              <p>
                GitHub account linking will automatically occur in the
                background if the user signs into Beehive. You can refresh the
                page to pull the latest info.
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {user.slackUsername ? (
          <>
            <h2 className="font-light text-2xl text-color-header-text">
              Slack Identity
            </h2>
            <h1 className="font-light text-4xl">{user.slackUsername}</h1>
            <p>
              This information is sourced directly by Sherlock via its Slack
              authentication.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>Username</div>
              <div className="break-words">
                <CopyableText>{user.slackUsername}</CopyableText>
              </div>
              <div>User ID</div>
              <div className="break-words">
                <CopyableText>{user.slackID}</CopyableText>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-light text-2xl text-color-header-text">
              No Linked Slack Identity
            </h2>
            {isServiceAccount ? (
              <p>
                Service accounts won't generally have a linked Slack identity.
              </p>
            ) : (
              <p>
                Slack identity linking will automatically occur in the
                background if the user signs into Beehive. You can refresh the
                page to pull the latest info.
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-light text-2xl text-color-header-text">Metadata</h2>
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
