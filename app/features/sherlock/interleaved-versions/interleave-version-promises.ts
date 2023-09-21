import {
  ApiResponse,
  V2controllersAppVersion,
  V2controllersChartVersion,
} from "@sherlock-js-client/sherlock";

export type InterleavedVersion =
  | {
      type: "app";
      version: V2controllersAppVersion;
    }
  | {
      type: "chart";
      version: V2controllersChartVersion;
    };

export async function interleaveVersionPromises(
  appVersionsPromise: Promise<ApiResponse<V2controllersAppVersion[]>>,
  chartVersionsPromise: Promise<ApiResponse<V2controllersChartVersion[]>>,
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
