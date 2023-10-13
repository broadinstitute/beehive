import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { NavLink, useActionData } from "@remix-run/react";
import type { SherlockUserV3Upsert } from "@sherlock-js-client/sherlock";
import { UsersApi } from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";
import { UserEditableFields } from "~/features/sherlock/users/edit/user-editable-fields";
import { UserColors } from "~/features/sherlock/users/user-colors";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { sessionFields } from "~/session.server";
import { useUserContext } from "./_layout.users.$userEmail";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/users/${params.userEmail}/edit`}>Edit</NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - User - Edit` },
];

export async function action({ request }: ActionFunctionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  const nameFromField = formData.get("nameFrom");
  const nameField = formData.get("name");
  const userRequest: SherlockUserV3Upsert = {
    // We aren't using formDataToObject here because we want different empty string
    // handling. For nameFrom we don't want to pass an empty string, but for name we
    // do.
    nameFrom:
      nameFromField === "slack" ||
      nameFromField === "github" ||
      nameFromField === "sherlock"
        ? nameFromField
        : undefined,
    name: typeof nameField === "string" ? nameField : undefined,
    githubAccessToken: session.get(sessionFields.githubAccessToken),
  };

  const api = new UsersApi(SherlockConfiguration);

  return api
    .apiUsersV3Put(
      {
        user: userRequest,
      },
      handleIAP(request),
    )
    .then(
      (user) => redirect(`/users/${user.email}`),
      makeErrorResponseReturner(userRequest),
    );
}

export const ErrorBoundary = PanelErrorBoundary;

export default function Route() {
  const errorInfo = useActionData<typeof action>();
  const { user } = useUserContext();
  return (
    <OutsetPanel>
      <ActionBox
        title={`Now Editing ${user.email}`}
        submitText="Click to Save Edits"
        {...UserColors}
      >
        <UserEditableFields user={errorInfo?.formState || user} />
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
}
