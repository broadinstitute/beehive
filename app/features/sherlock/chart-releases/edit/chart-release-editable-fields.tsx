import { useState } from "react";
import { TextField } from "~/components/interactivity/text-field";

export interface ChartReleaseEditableFieldsProps {
  chartExposesEndpoint?: boolean;

  defaultSubdomain?: string;
  defaultProtocol?: string;
  defaultPort?: string;
  baseDomain?: string;
}

export const ChartReleaseEditableFields: React.FunctionComponent<
  ChartReleaseEditableFieldsProps
> = ({
  chartExposesEndpoint,
  defaultSubdomain,
  defaultProtocol,
  defaultPort,
  baseDomain,
}) => {
  const [subdomain, setSubdomain] = useState(defaultSubdomain || "");
  const [protocol, setProtocol] = useState(defaultProtocol || "");
  const [port, setPort] = useState(defaultPort || "");
  if (chartExposesEndpoint) {
    return (
      <div className="flex flex-col space-y-4">
        {baseDomain && subdomain && protocol && port && (
          <>
            <p>The below fields all result in this chart having a URL of:</p>
            <p className="font-mono">{`${protocol}://${subdomain}.${baseDomain}:${port}`}</p>
          </>
        )}
        <p>
          Note that these fields aren't the source of truth--the chart can do
          whatever it likes--but setting these correctly can help our systems
          find the app online.
        </p>
        <label>
          <h2 className="font-light text-2xl">Subdomain</h2>
          <TextField
            name="subdomain"
            value={subdomain}
            onChange={(e) => setSubdomain(e.currentTarget.value)}
            placeholder={defaultSubdomain || "(can be left empty)"}
          />
        </label>
        <label>
          <h2 className="font-light text-2xl">Protocol</h2>
          <TextField
            name="protocol"
            value={protocol}
            onChange={(e) => setProtocol(e.currentTarget.value)}
            placeholder={defaultProtocol || "(can be left empty)"}
          />
        </label>
        <label>
          <h2 className="font-light text-2xl">Port</h2>
          <TextField
            name="port"
            value={port}
            onChange={(e) => setPort(e.currentTarget.value)}
            placeholder={defaultPort || "(can be left empty)"}
          />
        </label>
      </div>
    );
  } else {
    return (
      <p>
        This chart isn't flagged as having an endpoint so those options aren't
        available here.
      </p>
    );
  }
};
