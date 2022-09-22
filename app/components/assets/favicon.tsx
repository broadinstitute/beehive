import { SVGProps } from "react";

// Favicon is a component-ized version of app/assets/favicon.svg. This being a component
// means that when we embed it, it is both easier controlled on our end and faster loaded on
// clients'. https://react-svgr.com/playground is a website that can generate this component
// syntax from an actual SVG file, if you were to edit it.
const Favicon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="500mm"
    height="500mm"
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      className="fill-amber-300"
      d="M42.5 138.333h415c23.545 0 42.5 18.955 42.5 42.5s-18.955 42.5-42.5 42.5h-415c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5zM92.5 276.667h315c23.545 0 42.5 18.955 42.5 42.5s-18.955 42.5-42.5 42.5h-315c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5zM142.5 0h215C381.045 0 400 18.955 400 42.5S381.045 85 357.5 85h-215C118.955 85 100 66.045 100 42.5S118.955 0 142.5 0ZM192.5 415h115c23.545 0 42.5 18.955 42.5 42.5S331.045 500 307.5 500h-115c-23.545 0-42.5-18.955-42.5-42.5s18.955-42.5 42.5-42.5Z"
    />
  </svg>
);

export default Favicon;
