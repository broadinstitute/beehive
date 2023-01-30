import { LinkChip } from "~/components/interactivity/link-chip";
import { AppVersionColors } from "./app-version-colors";

export const AppVersionLinkChip: React.FunctionComponent<{
  chart: string;
  appVersionExact: string;
}> = ({ chart, appVersionExact }) => (
  <LinkChip
    text={`App Version: ${appVersionExact}`}
    to={`/charts/${chart}/app-versions/${appVersionExact}`}
    {...AppVersionColors}
  />
);
