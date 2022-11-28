// BeehiveIcon is a component-ized version of app/assets/favicon.svg. This being a component
// means that when we embed it, it is both easier controlled on our end and faster loaded on
// clients'. The link below is a website that can generate this component syntax from an
// actual SVG file, if you were to edit it. You'd need to do some additions because we use
// this as a loading animation too.
// https://react-svgr.com/playground/?svgoConfig=%7B%22plugins%22%3A%5B%7B%22name%22%3A%22preset-default%22%2C%22params%22%3A%7B%22overrides%22%3A%7B%22removeTitle%22%3Afalse%2C%22mergePaths%22%3Afalse%2C%22cleanupIDs%22%3Afalse%7D%7D%7D%5D%7D&typescript=true

export interface BeehiveIconProps {
  loading?: boolean;
  className?: string;
}

export const BeehiveIcon: React.FunctionComponent<BeehiveIconProps> = ({
  loading,
  className,
}) => (
  <svg
    width="500mm"
    height="500mm"
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      className={`fill-color-beehive-logo ${loading ? "beehive-loading" : ""}`}
      d="M142.5 0h215C381.045 0 400 18.955 400 42.5S381.045 85 357.5 85h-215C118.955 85 100 66.045 100 42.5S118.955 0 142.5 0Z"
    />
    <path
      className={`fill-color-beehive-logo ${loading ? "beehive-loading" : ""}`}
      d="M42.5 138.333h415c23.545 0 42.5 18.955 42.5 42.5s-18.955 42.5-42.5 42.5h-415c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5z"
    />
    <path
      className={`fill-color-beehive-logo ${loading ? "beehive-loading" : ""}`}
      d="M92.5 276.667h315c23.545 0 42.5 18.955 42.5 42.5s-18.955 42.5-42.5 42.5h-315c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5z"
    />
    <path
      className={`fill-color-beehive-logo ${loading ? "beehive-loading" : ""}`}
      d="M192.5 415h115c23.545 0 42.5 18.955 42.5 42.5S331.045 500 307.5 500h-115c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5Z"
    />
  </svg>
);
