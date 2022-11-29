import { useEffect, useState } from "react";

enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

const defaultTheme: Theme = Theme.LIGHT;
const defaultThemeForDarkOS: Theme = Theme.DARK;

const localStorageKey: string = "beehive-theme";
const documentElementAttribute: string = "data-theme";
const unsetThemeAlias: string = "default";

export const ThemeDropdown: React.FunctionComponent = () => {
  const [dropdownValue, setDropdownValue] = useState<string | undefined>();
  // Computing the initial value client-side means that it'll briefly flash an
  // incorrect value first before React hydrates. Fix is to just make the
  // dropdown fade in after hydration, which at least looks intentional.
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    let initialDropdownValue = localStorage.getItem(localStorageKey);
    if (!initialDropdownValue) {
      initialDropdownValue = unsetThemeAlias;
    }
    setDropdownValue(initialDropdownValue);
    setShowDropdown(true);
  }, []);
  return (
    <label
      className={`inline-block font-light transition-opacity duration-500 ${
        showDropdown ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="align-middle">Theme: </span>
      <select
        className="text-center align-middle bg-color-far-bg border rounded-md border-color-text-box-border border-opacity-50 focus-visible:outline focus-visible:outline-color-focused-element"
        value={dropdownValue}
        onChange={(e) => {
          let themeToSet = e.target.value;
          setDropdownValue(themeToSet);
          if (themeToSet === unsetThemeAlias) {
            localStorage.removeItem(localStorageKey);
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              themeToSet = defaultThemeForDarkOS;
            } else {
              themeToSet = defaultTheme;
            }
          } else {
            localStorage.setItem(localStorageKey, themeToSet);
          }
          document.documentElement.setAttribute(
            documentElementAttribute,
            themeToSet
          );
        }}
      >
        {[unsetThemeAlias, ...Object.values(Theme)].map((theme) => (
          <option value={theme} key={theme}>
            {theme}
          </option>
        ))}
      </select>
    </label>
  );
};

// This const stores the *text* of a function (see the trailing
// `.toString()`) that handles loading the theme from local
// storage and setting defaults. The LoadThemeSetter component
// is what actually injects this code into the document.
const setThemeFromLocalStorageFunctionText = ((
  localStorageKey: string,
  documentElementAttribute: string,
  defaultTheme: Theme,
  defaultThemeForDarkOS: Theme
): void => {
  let themeToSet = localStorage.getItem(localStorageKey);
  if (!themeToSet) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      themeToSet = defaultThemeForDarkOS;
    } else {
      themeToSet = defaultTheme;
    }
  }
  document.documentElement.setAttribute(documentElementAttribute, themeToSet);
}).toString();

export const LoadThemeSetter: React.FunctionComponent<{
  nonce?: string;
}> = ({ nonce }) => (
  <script
    nonce={nonce}
    suppressHydrationWarning={true}
    dangerouslySetInnerHTML={{
      __html: `(${setThemeFromLocalStorageFunctionText})("${localStorageKey}", "${documentElementAttribute}", "${defaultTheme}", "${defaultThemeForDarkOS}")`,
    }}
  ></script>
);
