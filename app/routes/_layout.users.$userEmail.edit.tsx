import { ActionArgs, redirect, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Params, useActionData } from "@remix-run/react";
import {
  UsersApi,
  V2controllersEditableUser,
} from "@sherlock-js-client/sherlock";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { PanelErrorBoundary } from "~/errors/components/error-boundary";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { makeErrorResponseReturner } from "~/errors/helpers/error-response-handlers";
import {
  forwardIAP,
  SherlockConfiguration,
} from "~/features/sherlock/sherlock.server";
import { UserEditableFields } from "~/features/sherlock/users/edit/user-editable-fields";
import { UserColors } from "~/features/sherlock/users/user-colors";
import { formDataToObject } from "~/helpers/form-data-to-object.server";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { sessionFields } from "~/session.server";
import { useUserContext } from "./_layout.users.$userEmail";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/users/${params.userEmail}/edit`}>Edit</NavLink>
  ),
};

export const meta: V2_MetaFunction = ({ params }) => [
  { title: `${params.userEmail} - User - Edit` },
];

export async function action({ request, params }: ActionArgs) {
  const session = await getValidSession(request);

  const formData = await request.formData();
  const userRequest: V2controllersEditableUser = {
    ...formDataToObject(formData, false),
    nameInferredFromGithub: formData.get("nameInferredFromGithub") === "true",
  };

  const api = new UsersApi(SherlockConfiguration);

  return api
    .apiV2UsersSelectorPatch(
      {
        selector: params.userEmail || "",
        user: userRequest,
      },
      forwardIAP(request)
    )
    .then(() =>
      api.apiV2ProceduresUsersLinkGithubPost(
        {
          githubAccessPayloadRequest: {
            githubAccessToken: session.get(sessionFields.githubAccessToken),
          },
        },
        forwardIAP(request)
      )
    )
    .then(
      (user) => redirect(`/users/${user.email}`),
      makeErrorResponseReturner(userRequest)
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
