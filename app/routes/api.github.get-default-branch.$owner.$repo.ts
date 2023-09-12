import { Octokit } from "@octokit/rest";
import type { ActionArgs } from "@remix-run/node";
import { getValidSession } from "~/helpers/get-valid-session.server";
import { sessionFields } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const session = await getValidSession(request).catch(() => null);
  let branch: string = "";
  if (session && params.owner && params.repo) {
    branch = await new Octokit({
      auth: session.get(sessionFields.githubAccessToken),
    }).repos
      .get({
        owner: params.owner,
        repo: params.repo,
      })
      .then(
        (result) => result.data.default_branch,
        () => "",
      );
  }
  console.log(
    `asked to look up default branch for ${params.owner}/${params.repo}, returned "${branch}"`,
  );
  return branch;
}
