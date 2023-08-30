import React, { useCallback, useMemo, useState } from "react";

export type SidebarPartial = React.FunctionComponent<{ filterText: string }>;

/**
 * useSidebar exposes functionality for components to share a top-level
 * dynamic sidebar (a helper "panel" that Remix isn't responsible for routing).
 *
 * At the route level, use it like any other hook:
 *
 * ```tsx
 * const { setSidebarFilterText, setSidebar, isSidebarPresent, SidebarComponent } = useSidebar();
 * ```
 *
 * Subcomponents can union their props with SetsSidebarProps to accept the setters from the route:
 *
 * ```tsx
 * export const AppVersionPicker: React.FunctionComponent<
 *   {
 *     // ...
 *   } & SetsSidebarProps
 * > = ({
 *   setSidebarFilterText,
 *   setSidebar,
 *   // ...
 * }) => // ...
 * ```
 *
 * Inside those subcomponents, the setters can be used to control the sidebar that appears at the top level.
 *
 * When a sidebar should appear, call setSidebar with a SidebarPartial function component. You may set an initial
 * filter state by passing a second argument. You may pass no arguments to remove the current sidebar.
 *
 * When the sidebar's filter text should change, call setSidebarFilterText. Here's an example:
 *
 * ```tsx
 * <TextField
 *   name="toAppVersionExact"
 *   value={appVersionExact}
 *   onChange={(e) => {
 *     setAppVersionExact(e.currentTarget.value);
 *     setSidebarFilterText(e.currentTarget.value);
 *   }}
 *   onFocus={() => {
 *     setSidebar(({ filterText }) => (
 *       <SidebarSelectAppVersion
 *         appVersions={appVersions}
 *         fieldValue={filterText}
 *         setFieldValue={(value) => {
 *           setAppVersionExact(value);
 *           setSidebar();
 *         }}
 *       />
 *     ));
 *   }}
 * />
 * ```
 *
 * Note that it is *critical* that the `filterText` SidebarPartial prop be what controls the sidebar's current
 * text, even if the value of the text field is actually controlled by a useState. The sidebar will be rendered
 * outside the subcomponent, so useState in the subcomponent won't be able to update the sidebar elsewhere in
 * DOM. This custom hook exists to hoist that controlled state high enough in the tree that the sidebar will
 * properly update.
 */
export function useSidebar() {
  const [sidebarFilterText, setSidebarFilterText] = useState<string>("");
  const [SidebarPartial, setSidebarPartial] = useState<
    SidebarPartial | undefined
  >();
  const isSidebarPresent = SidebarPartial !== undefined;
  const [wasSidebarPresent, setWasSidebarPresent] = useState(isSidebarPresent);
  if (isSidebarPresent && !wasSidebarPresent) {
    setWasSidebarPresent(true);
  }

  const setSidebar = useCallback(
    (sidebar?: SidebarPartial, initialFilterText?: string) => {
      if (sidebar) {
        setSidebarPartial(() => sidebar);
      } else {
        setSidebarPartial(undefined);
      }
      if (initialFilterText) {
        setSidebarFilterText(initialFilterText);
      } else {
        setSidebarFilterText("");
      }
    },
    [setSidebarPartial, setSidebarFilterText],
  );

  const SidebarComponent = useMemo<React.FunctionComponent>(
    () => () =>
      (SidebarPartial && <SidebarPartial filterText={sidebarFilterText} />) ||
      null,
    [sidebarFilterText, SidebarPartial],
  );

  return {
    setSidebarFilterText,
    setSidebar,
    isSidebarPresent,
    wasSidebarPresent,
    SidebarComponent,
  };
}

export interface SetsSidebarProps
  extends Pick<
    ReturnType<typeof useSidebar>,
    "setSidebarFilterText" | "setSidebar"
  > {}
