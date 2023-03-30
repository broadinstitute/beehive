import { Link } from "@remix-run/react";
import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="fill">
      <FillerText title="Apps">
        <p>
          This section is specifically geared towards independent releases in
          live environments.
        </p>
        <p>
          For monolith releases or updates to BEEs, head over to the{" "}
          <Link
            to="/environments"
            prefetch="intent"
            className="underline decoration-color-link-underline"
          >
            environments section
          </Link>
          .
        </p>
      </FillerText>
    </InsetPanel>
  );
}
