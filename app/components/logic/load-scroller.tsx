/*
LoadScroller is some magic informed by the internals of Remix and React.

It is meant to go directly into the root element, before the part that
hydrates React.

Here's the overview:

 - During normal operation, when the ScrollControlRoute size grows, it
   smooth-scrolls to the right. This is browser control, so it only
   runs in the browser. This makes sure that when we add content to the
   right, it comes into view.

 - Remix doesn't work like normal React, though--rather than React
   rendering content that is then shown to the user, Remix server-
   renders the content, shows that to the user, *then* hydrates React.
   This really only matters upon initial page load, because afterwards,
   React Router takes over in the browser and handles client navigation.

 - When a user loads a page for the first time, though, if they go to a
   direct link of a deeply-nested page, the React-powered scroll happens
   *after content is already visible to them*. This causes "scroll flash"
   that is visually jarring, actually made worse by how fast Beehive is
   (if you think about it, you've definitely seen scroll flash before,
   but not so instantly that it looks like a glitch).
   
 - Solution? Use raw Javascript, run before React hydration, to do an
   initial scroll. We grab the div from the server-rendered
   ScrollControlRoute component and manually scroll it to the right.
   We do this by rendering a script tag directly onto the page,
   dodging React's protections and warnings to do so. This means that the
   scroll happens before anything is shown to the user while still
   doing server-side rendering.

 - An alternative implementation would be to put code like this in the
   entry.client.tsx file, but I personally think co-locating it here with
   the rest of the scroll-controlling makes it more obvious what goes on
   (even if the javascript does have to be in a string). The entrypoint
   is pretty deep into Remix-land while this here is just an odd React
   component.
*/

import { scrollDivID } from "~/routes/_layout";

const scrollToRightFunctionText = ((scrollDivID: string): void => {
  const scrollControlDiv = document.getElementById(scrollDivID);
  if (scrollControlDiv !== null) {
    scrollControlDiv.scrollLeft = scrollControlDiv.scrollWidth;
  }
}).toString();

export const LoadScroller: React.FunctionComponent<{
  nonce?: string;
}> = ({ nonce }) => (
  <script
    nonce={nonce}
    suppressHydrationWarning={true}
    dangerouslySetInnerHTML={{
      __html: `(${scrollToRightFunctionText})("${scrollDivID}")`,
    }}
  ></script>
);
