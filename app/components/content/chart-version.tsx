import { V2controllersChartVersion } from "@sherlock-js-client/sherlock";
import { NavButton } from "../interactivity/nav-button";
import { PrettyPrintTime } from "../logic/pretty-print-time";
import { DataTypeColors } from "./helpers";

export const ChartVersionColors: DataTypeColors = {
  borderClassName: "border-violet-300",
  backgroundClassName: "bg-violet-50",
};

export interface ChartVersionDetailsProps {
  chartVersion: V2controllersChartVersion;
}

export const ChartVersionDetails: React.FunctionComponent<
  ChartVersionDetailsProps
> = ({ chartVersion }) => (
  <div className="flex flex-col space-y-10">
    {chartVersion.parentChartVersion &&
      chartVersion.parentChartVersionInfo &&
      chartVersion.parentChartVersionInfo.hasOwnProperty("chartVersion") && (
        <div className="flex flex-col space-y-2">
          <p>
            Sherlock has{" "}
            <span className="font-mono">{chartVersion.parentChartVersion}</span>{" "}
            recorded as this version's "parent."
          </p>
          <p>
            This generally means that DevOps's systems will place this{" "}
            <span className="font-mono">{chartVersion.chartVersion}</span> as
            coming after{" "}
            <span className="font-mono">
              {
                (
                  chartVersion.parentChartVersionInfo as V2controllersChartVersion
                ).chartVersion
              }
            </span>{" "}
            wherever chartlicable, like for calculcating version diffs.
          </p>
          <NavButton
            to={`../${
              (chartVersion.parentChartVersionInfo as V2controllersChartVersion)
                .chartVersion
            }`}
            sizeClassName="w-[29vw]"
            {...ChartVersionColors}
          >
            Jump to Parent
          </NavButton>
        </div>
      )}
    <p>
      This Chart Version was first recorded in Sherlock at{" "}
      <PrettyPrintTime time={chartVersion.createdAt} />.
    </p>
  </div>
);

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
