import { MetaFunction } from "@remix-run/node";
import { NavLink, Params } from "@remix-run/react";
import { catchBoundary } from "~/components/boundaries/catch-boundary";
import { errorBoundary } from "~/components/boundaries/error-boundary";
import { ChartReleaseColors } from "~/components/content/chart-release/chart-release-colors";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ItemDetails } from "~/components/panel-structures/item-details";
import { Branch } from "~/components/route-tree/branch";

export const handle = {
  breadcrumb: (params: Readonly<Params<string>>) => (
    <NavLink
      to={`/trigger-incident/${params.environmentName}/chart-releases/${params.chartName}/success`}
    >
      Incident Triggered
    </NavLink>
  ),
};

export const meta: MetaFunction = ({ params }) => ({
  title: `${params.environmentName}/${params.chartName} - Incident Triggered`,
});

export const CatchBoundary = catchBoundary;
export const ErrorBoundary = errorBoundary;

const SuccessRoute: React.FunctionComponent = () => {
  return (
    <Branch>
      <OutsetPanel {...ChartReleaseColors}>
        <ItemDetails title="Incident Triggered">
          <p>
            An incident has been triggered. You can follow-up with the on-call
            engineer in{" "}
            <a
              href="https://broadinstitute.slack.com/archives/CA1481PRN"
              target="_blank"
              className="underline decoration-color-link-underline"
            >
              #workbench-resilience in Slack
            </a>
            .
          </p>
        </ItemDetails>
      </OutsetPanel>
    </Branch>
  );
};

export default SuccessRoute;
