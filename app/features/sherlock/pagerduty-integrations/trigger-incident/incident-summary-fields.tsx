import { TextAreaField } from "~/components/interactivity/text-area-field";

export const IncidentSummaryFields: React.FunctionComponent<{
  initialSummary?: string;
}> = ({ initialSummary }) => (
  <div className="flex flex-col space-y-4">
    <label>
      <h2 className="font-light text-2xl">Summary</h2>
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
  </div>
);
