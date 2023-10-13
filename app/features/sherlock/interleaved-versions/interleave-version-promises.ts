import {
  ApiResponse,
  SherlockAppVersionV3,
  SherlockChartVersionV3,
} from "@sherlock-js-client/sherlock";

export type InterleavedVersion =
  | {
      type: "app";
      version: SherlockAppVersionV3;
    }
  | {
      type: "chart";
      version: SherlockChartVersionV3;
    };

export async function interleaveVersionPromises(
  appVersionsPromise: Promise<ApiResponse<SherlockAppVersionV3[]>>,
  chartVersionsPromise: Promise<ApiResponse<SherlockChartVersionV3[]>>,
  ...extraProcesses: ((
    versions: InterleavedVersion[],
  ) => InterleavedVersion[])[]
): Promise<{
  complete: boolean;
  versions: InterleavedVersion[];
}> {
  const [appVersionsResponse, chartVersionsResponse] = await Promise.all([
    appVersionsPromise.catch(() => null),
    chartVersionsPromise.catch(() => null),
  ]);

  const complete =
    appVersionsResponse?.raw.status === 200 &&
    chartVersionsResponse?.raw.status === 200;

  let versions = [
    ...((await appVersionsResponse
      ?.value()
      .catch(() => [])
      .then((appVersions) =>
        appVersions.map((appVersion) => ({
          type: "app" as const,
          version: appVersion,
        })),
      )) ?? []),
    ...((await chartVersionsResponse
      ?.value()
      .catch(() => [])
      .then((chartVersions) =>
        chartVersions.map((chartVersion) => ({
          type: "chart" as const,
          version: chartVersion,
        })),
      )) ?? []),
  ].sort((a, b) => +(b.version.updatedAt ?? 0) - +(a.version.updatedAt ?? 0));

  for (const extraProcess of extraProcesses) {
    versions = extraProcess(versions);
  }

  return { complete, versions };
}
