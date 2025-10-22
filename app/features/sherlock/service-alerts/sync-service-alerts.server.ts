import type { SherlockServiceAlertV3SyncRequest } from "@sherlock-js-client/sherlock";
import { ServiceAlertApi } from "@sherlock-js-client/sherlock";
import {
  SherlockConfiguration,
  handleIAP,
} from "~/features/sherlock/sherlock.server";

/**
 * Syncs service alerts for a specific environment to ensure Terra's Google Buckets
 * have the latest service alert JSON files that match Sherlock's database.
 * @throws Error if the sync operation fails
 */
export async function syncServiceAlerts(
  request: Request,
  environment: string,
): Promise<void> {
  const syncRequest: SherlockServiceAlertV3SyncRequest = {
    onEnvironment: environment,
  };

  try {
    await new ServiceAlertApi(
      SherlockConfiguration,
    ).apiServiceAlertsProceduresV3SyncPost(
      { environment: syncRequest },
      handleIAP(request),
    );
  } catch (error) {
    // Re-throw with more context about the sync operation
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to sync service alerts for environment "${environment}": ${message}`,
    );
  }
}
