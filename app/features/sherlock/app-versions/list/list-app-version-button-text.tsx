import { SerializeFrom } from "@remix-run/node";
import { V2controllersAppVersion } from "@sherlock-js-client/sherlock";

export const ListAppVersionButtonText: React.FunctionComponent<{
  appVersion: SerializeFrom<V2controllersAppVersion>;
}> = ({ appVersion }) => (
  <h2 className="font-light">
    {`${appVersion.chart} app @ `}
    <span className="font-medium">{appVersion.appVersion}</span>
  </h2>
);
