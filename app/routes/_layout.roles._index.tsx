import { InsetPanel } from "~/components/layout/inset-panel";
import { FillerText } from "~/components/panel-structures/filler-text";
import { RoleHelpCopy } from "~/features/sherlock/roles/role-help-copy";

export default function Route() {
  return (
    <InsetPanel largeScreenOnly size="fill">
      <FillerText title="Roles">
        <RoleHelpCopy />
      </FillerText>
    </InsetPanel>
  );
}
