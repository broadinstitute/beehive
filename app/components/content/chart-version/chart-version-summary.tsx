import { NavButton } from "~/components/interactivity/nav-button";
import { ChartVersionColors } from "./chart-version-colors";

export interface ChartVersionSummaryProps {
  chartName?: string | undefined;
  chartVersionResolver?: string | undefined;
  chartVersionExact?: string | undefined;
  helmfileRef?: string | undefined;
  renderChartVersionLink: boolean;
}

export const ChartVersionSummary: React.FunctionComponent<
  ChartVersionSummaryProps
> = ({
  chartName,
  chartVersionResolver,
  chartVersionExact,
  helmfileRef,
  renderChartVersionLink,
}) => {
  let explanation: JSX.Element;
  switch (chartVersionResolver) {
    case "exact":
      explanation = (
        <p>
          This chart version was directly specified. Refreshing won't affect it.
        </p>
      );
      break;
    case "latest":
      explanation = (
        <p>
          This chart version was the most recent one during the last refresh;{" "}
          <span className="font-mono">latest</span> is what's specified.
          Refreshing will recalculate it.
        </p>
      );
      break;
    default:
      explanation = <p></p>;
      break;
  }
  return (
    <div className="flex flex-col space-y-2">
      <h2 className="font-light text-4xl">
        {`${chartName} chart @ ${chartVersionExact}`}
      </h2>
      {explanation}
      <p>
        Configuration uses values from terra-helmfile's{" "}
        <a
          href={`https://github.com/broadinstitute/terra-helmfile/tree/${helmfileRef}/values`}
          className="font-mono underline decoration-blue-500"
        >
          {helmfileRef}
        </a>
        .
      </p>
      {renderChartVersionLink && (
        <NavButton
          to={`/charts/${chartName}/chart-versions/${chartVersionExact}`}
          sizeClassName="w-[29vw]"
          {...ChartVersionColors}
        >
          <h2 className="font-medium">Jump to This Chart Version</h2>
        </NavButton>
      )}
    </div>
  );
};
