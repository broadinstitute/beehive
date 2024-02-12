import type { SerializeFrom } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import type { SherlockPagerdutyIntegrationV3 } from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { SidebarFilterList } from "~/components/panel-structures/sidebar-filter-list";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import type { SummarizedErrorInfo } from "~/errors/helpers/summarize-response-error";
import type { ColorProps } from "~/features/color-class-names";
import { PagerdutyIntegrationColors } from "~/features/sherlock/pagerduty-integrations/pagerduty-integration-colors";
import { matchPagerdutyIntegration } from "../list/match-pagerduty-integration";
import type { LinkPagerdutyFieldsProps } from "./link-pagerduty-fields";
import { LinkPagerdutyFields } from "./link-pagerduty-fields";

export const LinkPagerdutyPanel: React.FunctionComponent<
  {
    pagerdutyIntegrations: SerializeFrom<SherlockPagerdutyIntegrationV3[]>;
    existingPagerdutyId?: string;
    errorInfo?: SerializeFrom<{ errorSummary: SummarizedErrorInfo }>;
  } & Pick<LinkPagerdutyFieldsProps, "pdAppID" | "dest"> &
    ColorProps
> = ({
  pagerdutyIntegrations,
  existingPagerdutyId,
  errorInfo,
  pdAppID,
  dest,
  backgroundClassName,
  beforeBorderClassName,
  borderClassName,
}) => {
  const [searchParams] = useSearchParams();

  const pagerdutyIntegrationsMap = new Map(
    pagerdutyIntegrations.map((pagerdutyIntegration) => [
      pagerdutyIntegration.pagerdutyID,
      pagerdutyIntegration,
    ]),
  );

  const [filterText, setFilterText] = useState("");
  const [selectedPagerdutyID, setSelectedPagerdutyID] = useState(
    searchParams.get("pd-id") || existingPagerdutyId || "",
  );

  return (
    <>
      <OutsetPanel>
        <ActionBox
          title="Configure PagerDuty Link"
          submitText="Click to Save Changes"
          backgroundClassName={backgroundClassName}
          beforeBorderClassName={beforeBorderClassName}
          borderClassName={borderClassName}
        >
          <LinkPagerdutyFields
            pdAppID={pdAppID}
            selectedPagerdutyID={selectedPagerdutyID}
            currentIntegrationName={
              pagerdutyIntegrationsMap.get(selectedPagerdutyID)?.name
            }
            dest={dest}
          />
          {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
        </ActionBox>
      </OutsetPanel>
      <InsetPanel>
        <SidebarFilterList
          title="Available Integrations"
          filterText={filterText}
          setFilterText={setFilterText}
          entries={pagerdutyIntegrations}
          filter={matchPagerdutyIntegration}
          handleListButtonClick={(entry) =>
            setSelectedPagerdutyID(entry.pagerdutyID || "")
          }
          detectListButtonActive={(entry) =>
            entry.pagerdutyID === selectedPagerdutyID
          }
          listButtonTextFactory={(entry) => entry.name}
          {...PagerdutyIntegrationColors}
        />
      </InsetPanel>
    </>
  );
};
