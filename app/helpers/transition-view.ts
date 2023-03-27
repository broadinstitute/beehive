import { flushSync } from "react-dom";

export async function transitionView(updateDOM: () => void) {
  if (
    !window ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !document ||
    // @ts-expect-error
    !document.startViewTransition
  ) {
    updateDOM();
  } else {
    // Okay so check this out. Typescript doesn't think this function exists but
    // it definitely does sometimes.
    // https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API#browser_compatibility
    // If it exists, we run the updatey function inside it.
    // @ts-expect-error
    document.startViewTransition(() => {
      // For this magic to work, though, we need React to actually do the updatey function
      // quickly so the browser can see the before and after. So we use the terrifying
      // "you shouldn't ever need this" React escape hatch `flushSync` to do the updatey
      // function basically synchronously.
      // Apparently Dan Abramov himself literally told the Chrome dev team that `flushSync`
      // is appropriate to use here.
      // https://developer.chrome.com/docs/web-platform/view-transitions/#working-with-frameworks
      flushSync(() => updateDOM());
    });
  }
}
