import { Link } from "@remix-run/react";
import { NavButton } from "~/components/interactivity/nav-button";
import { ChartVersionColors } from "./chart-version-colors";

export interface ChartVersionSummaryProps {
  chartName?: string;
  chartVersionResolver?: string;
  chartVersionExact?: string;
  chartVersionFollowChartRelease?: string;
  helmfileRef?: string;
  renderChartVersionLink: boolean;
}

export const ChartVersionSummary: React.FunctionComponent<
  ChartVersionSummaryProps
> = ({
  chartName,
  chartVersionResolver,
  chartVersionExact,
  chartVersionFollowChartRelease,
  helmfileRef,
  renderChartVersionLink,
}) => {
  let explanation: JSX.Element;
  switch (chartVersionResolver) {
    case "exact":
      explanation = (
        <p>
          This chart version was directly specified. Refreshing the versions
          won't affect it.
        </p>
      );
      break;
    case "follow":
      explanation = (
        <p>
          This chart version was the version in{" "}
          {chartVersionFollowChartRelease ? (
            <Link
              to={`/r/chart-release/${chartVersionFollowChartRelease}`}
              className="underline decoration-color-link-underline"
            >
              {chartVersionFollowChartRelease}
            </Link>
          ) : (
            "the followed instance"
          )}{" "}
          during the last refresh. Refreshing the versions will get whatever is
          there currently.
        </p>
      );
      break;
    case "latest":
      explanation = (
        <p>
          This chart version was the most recent one during the last refresh;{" "}
          <span className="font-mono">latest</span> is what's specified.
          Refreshing the versions will recalculate it.
        </p>
      );
      break;
    default:
      explanation = <p></p>;
      break;
  }
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="font-light text-4xl text-color-header-text">
        {`${chartName} chart @ ${chartVersionExact}`}
      </h2>
      {explanation}
      <p>
        Configuration uses values from terra-helmfile's{" "}
        <a
          href={`https://github.com/broadinstitute/terra-helmfile/tree/${helmfileRef}/values`}
          className="font-mono underline decoration-color-link-underline"
        >
          {helmfileRef}
        </a>
        .
      </p>
      {renderChartVersionLink && (
        <NavButton
          to={`/charts/${chartName}/chart-versions/${chartVersionExact}`}
          {...ChartVersionColors}
        >
          <h2 className="font-medium">View Details of This Chart Version</h2>
        </NavButton>
      )}
    </div>
  );
};
