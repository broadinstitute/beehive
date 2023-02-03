import { EnvironmentLinkChip } from "../environment-link-chip";

export const DuplicateBeeWarning: React.FunctionComponent<{
  template: string;
  matchingEnvironmentNames: string[];
}> = ({ template, matchingEnvironmentNames }) => (
  <div className="w-full rounded-2xl  bg-color-near-bg px-4 pt-3 pb-2 border-2 border-color-environment-border border-dashed font-light text-xl">
    <h3 className="font-light text-xl">
      Just a heads up, you already have{" "}
      {matchingEnvironmentNames.length > 1
        ? `some ${template} BEEs`
        : `a ${template} BEE`}
      :
    </h3>
    <ol>
      {matchingEnvironmentNames.map((environmentName, index) => (
        <li key={index} className="my-2 w-fit">
          <EnvironmentLinkChip environment={environmentName} />
        </li>
      ))}
    </ol>
  </div>
);
