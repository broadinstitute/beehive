import { SerializeFrom } from "@remix-run/node";
import {
  V2controllersChartRelease,
  V2controllersDatabaseInstance,
} from "@sherlock-js-client/sherlock";
import { useState } from "react";
import { ActionButton } from "~/components/interactivity/action-button";
import { EnumInputSelect } from "~/components/interactivity/enum-select";
import { TextField } from "~/components/interactivity/text-field";
import { OutsetPanel } from "~/components/layout/outset-panel";
import { ActionBox } from "~/components/panel-structures/action-box";
import { FormErrorDisplay } from "~/errors/components/form-error-display";
import { ReturnedErrorInfo } from "~/errors/helpers/error-response-handlers";
import { DatabaseInstanceColors } from "./database-instance-colors";

export const DatabaseInstancePanel: React.FunctionComponent<{
  chartRelease: SerializeFrom<V2controllersChartRelease>;
  databaseInstance: SerializeFrom<V2controllersDatabaseInstance> | null;
  errorInfo?: SerializeFrom<ReturnedErrorInfo<V2controllersDatabaseInstance>>;
}> = ({ chartRelease, databaseInstance, errorInfo }) => {
  const [noDatabaseInstance, setNoDatabaseInstance] = useState(
    !databaseInstance && !errorInfo,
  );
  const [platform, setPlatform] = useState<string>(
    errorInfo?.formState?.platform ||
      databaseInstance?.platform ||
      (chartRelease.environmentInfo?.lifecycle === "dynamic" ||
      chartRelease.environmentInfo?.lifecycle === "template"
        ? "kubernetes"
        : chartRelease.clusterInfo?.provider) ||
      "google",
  );
  return (
    <OutsetPanel>
      <ActionBox
        title={`Editing Database Metadata for ${chartRelease.name}`}
        submitText="Save Edits"
        hideButton={noDatabaseInstance}
        {...DatabaseInstanceColors}
      >
        {noDatabaseInstance ? (
          <>
            <p>
              Right now, {chartRelease.name} doesn't have any database metadata
              associated with it whatsoever.
            </p>
            <p>
              That means that{" "}
              <span className="font-mono">thelma sql connect</span> won't be
              able to automatically connect you to {chartRelease.name}'s
              database (if it has one). You can still specify database info
              manually on the command line.
            </p>
            <p>
              Clicking the button below will let you store database info in
              Beehive where <span className="font-mono">thelma</span> can read
              it. Then, anyone who runs{" "}
              <span className="font-mono">thelma sql connect</span> in the
              future can just specify {chartRelease.name} and it'll figure it
              out.
            </p>
            <ActionButton
              size="fill"
              type="button"
              onClick={() => setNoDatabaseInstance(false)}
              {...DatabaseInstanceColors}
            >
              Add Database Metadata
            </ActionButton>
          </>
        ) : (
          <>
            <input
              type="hidden"
              name="chartRelease"
              value={chartRelease.name}
            />
            <div className="flex flex-col gap-2">
              <h2 className="font-light text-2xl">Platform</h2>
              <p>The cloud platform providing the database instance.</p>
              <p>
                Our static environments like dev and prod usually have database
                instances provided directly by a cloud platform like Google or
                Azure, while BEEs use databases run ourselves inside Kubernetes
                so we can spin them up and down easier.
              </p>
              <EnumInputSelect
                name="platform"
                className="grid grid-cols-3"
                fieldValue={platform}
                setFieldValue={setPlatform}
                enums={[
                  ["Google", "google"],
                  ["Azure", "azure"],
                  ["Kubernetes", "kubernetes"],
                ]}
                {...DatabaseInstanceColors}
              />
            </div>
            <div
              className={`pl-6 border-l-2 border-color-divider-line ${
                platform === "google" || platform === "azure"
                  ? "flex"
                  : "hidden"
              } flex-col gap-4`}
            >
              <label
                className={`${
                  platform === "google" ? "flex" : "hidden"
                } flex-col gap-2`}
              >
                <h2 className="font-light text-2xl">Google Project</h2>
                <p>This is the Google project where the database is located.</p>
                <p>
                  We'll pull in the Kubernetes cluster's Google project as the
                  default, but it's theoretically possible for the projects to
                  be different, so you can edit it here if you need.
                </p>
                <TextField
                  name="googleProject"
                  defaultValue={
                    errorInfo?.formState?.googleProject ||
                    databaseInstance?.googleProject ||
                    chartRelease.clusterInfo?.googleProject
                  }
                  required={platform === "google"}
                />
              </label>
              <label
                className={`${
                  platform === "google" || platform === "azure"
                    ? "flex"
                    : "hidden"
                } flex-col gap-2`}
              >
                <h2 className="font-light text-2xl">Instance Name</h2>
                <p>
                  This is the exact name of the database instance to connect to.
                </p>
                <p>
                  This isn't the name of the database{" "}
                  <i className="italic">inside</i> the overall instance, that
                  field is below. This field is the name of the virtual machine
                  instance that is running the database.
                </p>
                <TextField
                  name="instanceName"
                  placeholder="(required)"
                  defaultValue={
                    errorInfo?.formState?.instanceName ||
                    databaseInstance?.instanceName
                  }
                  required={platform === "google" || platform === "azure"}
                />
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <h2 className="font-light text-2xl">Default Database</h2>
              <p>
                The default database inside the overall database instance to
                connect to.
              </p>
              <p>
                This often coincides with the Helm Chart name so we use that as
                the default, but apps may well have a non-standard database name
                or they may use multiple databases inside the same instance.
              </p>
              <p>
                It's always possible to explicitly set the name of the database
                to connect to with <span className="font-mono">thelma</span>,
                this value is just the default.
              </p>
              <TextField
                name="defaultDatabase"
                placeholder={
                  databaseInstance === null ? chartRelease.chart : undefined
                }
                defaultValue={
                  errorInfo?.formState?.defaultDatabase ||
                  databaseInstance?.defaultDatabase ||
                  chartRelease.chart
                }
                required
              />
            </label>
          </>
        )}
        {errorInfo && <FormErrorDisplay {...errorInfo.errorSummary} />}
      </ActionBox>
    </OutsetPanel>
  );
};
