import { SerializeFrom } from "@remix-run/node";
import { SherlockAppVersionV3 } from "@sherlock-js-client/sherlock";

export const ListAppVersionButtonText: React.FunctionComponent<{
  appVersion: SerializeFrom<SherlockAppVersionV3>;
}> = ({ appVersion }) => (
  <h2 className="font-light">
    {`${appVersion.chart} app @ `}
    <span className="font-medium">{appVersion.appVersion}</span>
  </h2>
);
