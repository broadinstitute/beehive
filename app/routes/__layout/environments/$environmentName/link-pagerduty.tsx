import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Params,
  NavLink,
  useLoaderData,
  useOutletContext,
  useActionData,
  useSearchParams,
} from "@remix-run/react";
import {
  EnvironmentsApi,
  PagerdutyIntegrationsApi,
  V2controllersEnvironment,
  V2controllersPagerdutyIntegration,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { EnvironmentColors } from "~/components/content/environment/environment-colors";
import { LinkPagerdutyFields } from "~/components/content/pagerduty-integration/link-pagerduty-fields";
import { PagerdutyIntegrationColors } from "~/components/content/pagerduty-integration/pagerduty-integration-colors";
import ActionButton from "~/components/interactivity/action-button";
import { ListControls } from "~/components/interactivity/list-controls";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { verifySessionCsrfToken } from "~/components/logic/csrf-token";
import { MemoryFilteredList } from "~/components/logic/memory-filtered-list";
import { getPdAppIdFromEnv } from "~/components/logic/pagerduty-token";
import { ActionBox } from "~/components/panel-structures/action-box";
import { InteractiveList } from "~/components/panel-structures/interactive-list";
import { Branch } from "~/components/route-tree/branch";
import { ActionErrorInfo, displayErrorInfo } from "~/helpers/errors";
import {
  errorResponseThrower,
  formDataToObject,
  forwardIAP,
  makeErrorResponserReturner,
  SherlockConfiguration,
} from "~/helpers/sherlock.server";
import { getSession } from "~/session.server";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink to={`/environments/${params.environmentName}/link-pagerduty`}>
      Link PagerDuty
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName} - Environment - Link PagerDuty`,
});

export const loader: LoaderFunction = async ({ request }) => {
  return Promise.all([
    new PagerdutyIntegrationsApi(SherlockConfiguration)
      .apiV2PagerdutyIntegrationsGet({}, forwardIAP(request))
      .catch(errorResponseThrower),
    getPdAppIdFromEnv(),
  ]);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  await verifySessionCsrfToken(request, session);

  const formData = await request.formData();
  const environmentRequest: V2controllersEnvironment = {
    ...formDataToObject(formData, false),
  };

  return new EnvironmentsApi(SherlockConfiguration)
    .apiV2EnvironmentsSelectorPatch(
      {
        selector: params.environmentName || "",
        environment: environmentRequest,
      },
      forwardIAP(request)
    )
    .then(
      (environment) => redirect(`/environments/${environment.name}`),
      makeErrorResponserReturner(environmentRequest)
    );
};

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const LinkPagerdutyRoute: React.FunctionComponent = () => {
  const [pagerdutyIntegrations, pdAppID] =
    useLoaderData<[Array<V2controllersPagerdutyIntegration>, string]>();
  const { environment } = useOutletContext<{
    environment: V2controllersEnvironment;
  }>();
  const actionData = useActionData<ActionErrorInfo<V2controllersEnvironment>>();
  const [searchParams] = useSearchParams();

  const pagerdutyIntegrationsMap = new Map(
    pagerdutyIntegrations.map((pagerdutyIntegration) => [
      pagerdutyIntegration.pagerdutyID,
      pagerdutyIntegration,
    ])
  );

  const [filterText, setFilterText] = useState("");
  const [selectedPagerdutyID, setSelectedPagerdutyID] = useState(
    searchParams.get("pd-id") ||
      environment.pagerdutyIntegrationInfo?.pagerdutyID ||
      ""
  );

  return (
    <Branch>
      <OutsetPanel>
        <ActionBox
          title="Configure PagerDuty Link"
          submitText="Click to Save Changes"
          {...EnvironmentColors}
        >
          <LinkPagerdutyFields
            pdAppID={pdAppID}
            selectedPagerdutyID={selectedPagerdutyID}
            currentIntegrationName={
              pagerdutyIntegrationsMap.get(selectedPagerdutyID)?.name
            }
            dest={`/environments/${environment.name}/link-pagerduty`}
          />
          {actionData && displayErrorInfo(actionData)}
        </ActionBox>
      </OutsetPanel>
      <Branch>
        <InsetPanel>
          <InteractiveList
            title="Available Integrations"
            {...PagerdutyIntegrationColors}
          >
            <ListControls
              setFilterText={setFilterText}
              {...PagerdutyIntegrationColors}
            />
            <MemoryFilteredList
              entries={pagerdutyIntegrations}
              filterText={filterText}
              filter={(pagerdutyIntegration, filterText) =>
                pagerdutyIntegration.name?.includes(filterText) ||
                pagerdutyIntegration.pagerdutyID?.includes(filterText)
              }
            >
              {(pagerdutyIntegration, index) => (
                <ActionButton
                  key={index.toString()}
                  onClick={() => {
                    setSelectedPagerdutyID(
                      pagerdutyIntegration.pagerdutyID || ""
                    );
                  }}
                  isActive={
                    selectedPagerdutyID === pagerdutyIntegration.pagerdutyID
                  }
                >
                  {pagerdutyIntegration.name}
                </ActionButton>
              )}
            </MemoryFilteredList>
          </InteractiveList>
        </InsetPanel>
      </Branch>
    </Branch>
  );
};

export default LinkPagerdutyRoute;
