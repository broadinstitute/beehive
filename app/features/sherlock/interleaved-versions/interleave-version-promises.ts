import type {
  ApiResponse,
  SherlockAppVersionV3,
  SherlockAppVersionV3ChangelogResponse,
  SherlockChartVersionV3,
  SherlockChartVersionV3ChangelogResponse,
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
    (appVersionsResponse?.raw.status == 200 &&
      chartVersionsResponse?.raw.status == 200) ||
    false;

  let versions = [
    ...((await appVersionsResponse
      ?.value()
      .catch(() => [])
      .then((response) =>
        response?.map((appVersion) => ({
          type: "app" as const,
          version: appVersion,
        })),
      )) ?? []),
    ...((await chartVersionsResponse
      ?.value()
      .catch(() => [])
      .then((response) =>
        response?.map((chartVersion) => ({
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

export async function interleaveChangelogPromises(
  appVersionsPromise: Promise<
    ApiResponse<SherlockAppVersionV3ChangelogResponse>
  >,
  chartVersionsPromise: Promise<
    ApiResponse<SherlockChartVersionV3ChangelogResponse>
  >,
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
  const appVersionResponse = await appVersionsResponse
    ?.value()
    .catch(() => ({ changelog: [], complete: false }));
  const chartVersionResponse = await chartVersionsResponse
    ?.value()
    .catch(() => ({ changelog: [], complete: false }));

  const complete =
    (appVersionsResponse?.raw.status == 200 &&
      chartVersionsResponse?.raw.status == 200 &&
      appVersionResponse?.complete &&
      chartVersionResponse?.complete) ||
    false;

  let versions = [
    ...(appVersionResponse?.changelog?.map((appVersion) => ({
      type: "app" as const,
      version: appVersion,
    })) ?? []),
    ...(chartVersionResponse?.changelog?.map((chartVersion) => ({
      type: "chart" as const,
      version: chartVersion,
    })) ?? []),
  ].sort((a, b) => +(b.version.updatedAt ?? 0) - +(a.version.updatedAt ?? 0));

  for (const extraProcess of extraProcesses) {
    versions = extraProcess(versions);
  }

  return { complete, versions };
}
