import { ActionArgs } from "@remix-run/node";
import {
  EnvironmentsApi,
  V2controllersEnvironment,
} from "@sherlock-js-client/sherlock";
import { json } from "react-router";
import { errorResponseThrower } from "~/errors/helpers/error-response-handlers";
import { runGha } from "~/features/github/run-gha";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { commitSession } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const session = await getValidSession(request);
  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    offline: formData.get("offline") === "true",
  };

  const environmentName = formData.get("environment");
  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorPatch(
      {
        selector: typeof environmentName === "string" ? environmentName : "",
        environment: environmentRequest,
      },
      handleIAP(request)
    )
    .then(async (environment) => {
      await runGha(
        session,
        {
          workflow_id: ".github/workflows/bee-start-stop.yaml",
          inputs: {
            "bee-name": `${environment.name}`,
            offline: `${environment.offline}`,
          },
        },
        environment.offline ? "stop your BEE" : "start your BEE"
      );
      return json(
        {},
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }, errorResponseThrower);
}
