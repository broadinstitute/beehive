import { LinkChip } from "~/components/interactivity/link-chip";
import { RoleColors } from "./role-colors";

export const RoleLinkChip: React.FunctionComponent<{
  role: string;
  arrow?: boolean;
}> = ({ role, arrow }) => (
  <LinkChip
    text={`Role: ${role}`}
    to={`/roles/${role}`}
    arrow={arrow}
    {...RoleColors}
  />
);
