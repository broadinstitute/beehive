import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import type { SherlockChangesetV3PlanRequest } from "@sherlock-js-client/sherlock";
import { ChangesetsApi } from "@sherlock-js-client/sherlock";
import { json } from "react-router";
import { buildNotifications } from "~/components/logic/notification";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession, sessionFields } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getValidSession(request);
  const formData = await request.formData();

  const changesetRequest: SherlockChangesetV3PlanRequest = {
    recreateChangesets: formData
      .getAll("changeset")
      .filter((value): value is string => typeof value === "string")
      .map((changesetID) => parseInt(changesetID)),
  };

  return new ChangesetsApi(SherlockConfiguration)
    .apiChangesetsProceduresV3PlanPost(
      {
        changesetPlanRequest: changesetRequest,
        verboseOutput: true, // Needs to be true so that chart release names are returned
      },
      handleIAP(request),
    )
    .then(async (changesets) => {
      if (changesets.length > 0) {
        return redirect(
          `/review-changesets?${[
            ...changesets.map((c) => `changeset=${c.id}`),
            `return=${encodeURIComponent(
              `/r/chart-release/${changesets[0].chartRelease}`,
            )}`,
          ].join("&")}`,
        );
      } else {
        session.flash(
          sessionFields.flashNotifications,
          buildNotifications({
            type: "error",
            text: "Sherlock identified that there were no meaningful changes to deploy. (Perhaps those versions are already presently deployed?)",
            error: true,
          }),
        );
        return json(
          { formState: changesetRequest },
          {
            headers: {
              "Set-Cookie": await commitSession(session),
            },
          },
        );
      }
    }, makeErrorResponseReturner(changesetRequest));
}
