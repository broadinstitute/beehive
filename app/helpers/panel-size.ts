export type PanelSize = "one-third" | "two-thirds" | "full-screen" | "fill";

export function panelSizeToOuterClassName(panelSize: PanelSize): string {
  switch (panelSize) {
    case "one-third":
      return "w-screen xl:w-[33vw]";
    case "two-thirds":
      return "w-screen xl:w-[66vw]";
    case "full-screen":
      return "w-screen";
    case "fill":
      return "grow w-min";
  }
}

export function panelSizeToInnerClassName(panelSize: PanelSize): string {
  switch (panelSize) {
    case "one-third":
      return "w-[90vw] xl:w-[30vw]";
    case "two-thirds":
      return "w-[90vw] xl:w-[60vw]";
    case "full-screen":
      return "w-[90vw]";
    case "fill":
      return "w-full";
  }
}
