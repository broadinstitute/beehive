export type PanelSize =
  | "one-third"
  | "one-fourth"
  | "two-thirds"
  | "full-screen"
  | "fill"
  | "almost-fill";

export function panelSizeToOuterClassName(panelSize: PanelSize): string {
  switch (panelSize) {
    case "one-third":
      return "w-screen laptop:w-[33vw] ultrawide:w-[20vw]";
    case "one-fourth":
      return "w-screen laptop:w-[25vw] ultrawide:w-[15vw]";
    case "two-thirds":
      return "w-screen laptop:w-[66vw] ultrawide:w-[40vw]";
    case "full-screen":
      return "w-screen";
    case "fill":
      return "grow w-min";
    case "almost-fill":
      return "grow w-min px-[1vw]";
  }
}

export function panelSizeToInnerClassName(panelSize: PanelSize): string {
  switch (panelSize) {
    case "one-third":
      return "w-[90vw] laptop:w-[30vw] ultrawide:w-[18vw]";
    case "one-fourth":
      return "w-[90vw] laptop:w-[22vw] ultrawide:w-[13vw]";
    case "two-thirds":
      return "w-[90vw] laptop:w-[60vw] ultrawide:w-[36vw]";
    case "full-screen":
      return "w-[90vw]";
    case "fill":
      return "w-full";
    case "almost-fill":
      return "w-full px-[1vw]";
  }
}
