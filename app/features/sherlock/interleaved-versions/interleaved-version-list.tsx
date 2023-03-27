import { SerializeFrom } from "@remix-run/node";
import { InterleavedVersion } from "./interleave-version-promises";

export const InterleavedVersionList: React.FunctionComponent<{
  versions: SerializeFrom<InterleavedVersion[]>;
}> = ({ versions }) => (
  <>
    {versions.map((v, index) =>
      v.type === "app" ? (
        <div key={index}>app {v.version.appVersion}</div>
      ) : (
        <div key={index}>chart {v.version.chartVersion}</div>
      )
    )}
  </>
);
