import { TextAreaField } from "~/components/interactivity/text-area-field";

export const IncidentSummaryFields: React.FunctionComponent<{
  initialSummary?: string;
  link?: string;
}> = ({ initialSummary, link = "https://broad.io/beehive" }) => (
  <div className="flex flex-col space-y-4">
    <label>
      <h2 className="font-light text-2xl text-color-header-text">Summary</h2>
      <p>
        Describe the issue here. This text will be sent to whoever gets paged.
      </p>
      <TextAreaField
        name="summary"
        wrap="soft"
        placeholder="(required)"
        defaultValue={initialSummary}
        required
      />
    </label>
    <input type="hidden" name="sourceLink" value={link} />
  </div>
);
