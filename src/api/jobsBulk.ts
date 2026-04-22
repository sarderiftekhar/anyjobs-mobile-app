import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { BulkJobAction, BulkJobActionResult } from "../types/analytics";

/**
 * Bulk job operations API.
 *
 * NOTE ON BACKEND:
 * - Web route `POST /employer/jobs/bulk-actions` exists
 *   (see routes/employer.php, JobController@bulkActions) and accepts
 *   `action` + `job_ids[]`.
 * - A shared route `POST /jobs/bulk` (role:employer,agent) is also present
 *   and accepts `action` in {publish, pause, delete, feature, unfeature}
 *   + `job_ids[]` (see routes/employer.php lines 254-300).
 * - No mobile equivalent yet — this client targets
 *   `/v1/mobile/employer/jobs/bulk` which a thin mobile wrapper should
 *   forward to JobController@bulkActions.
 * - If the route is missing (404), callers may fall back to calling the
 *   existing `/v1/mobile/employer/jobs/{id}/status` endpoint per job
 *   (see fallbackBulkStatus below).
 */
export const jobsBulkApi = {
  bulk: (action: BulkJobAction, jobIds: number[]) =>
    apiClient.post<ApiResponse<BulkJobActionResult>>("/employer/jobs/bulk", {
      action,
      job_ids: jobIds,
    }),

  /**
   * Fallback: sequentially apply a status change to multiple jobs using the
   * existing per-job status endpoint. Used when the bulk route is unavailable.
   * `action` is mapped to a status where possible; `delete` uses DELETE.
   */
  fallbackBulkStatus: async (action: BulkJobAction, jobIds: number[]): Promise<BulkJobActionResult> => {
    const statusMap: Partial<Record<BulkJobAction, string>> = {
      pause: "paused",
      resume: "active",
      close: "closed",
    };

    const failed: number[] = [];
    let affected = 0;

    for (const id of jobIds) {
      try {
        if (action === "delete") {
          await apiClient.delete(`/employer/jobs/${id}`);
        } else if (action === "feature" || action === "unfeature") {
          // No per-job feature endpoint on mobile — attempt bulk route once.
          await apiClient.post(`/employer/jobs/${id}/feature`, { featured: action === "feature" });
        } else {
          const status = statusMap[action];
          if (!status) throw new Error(`Unknown action: ${action}`);
          await apiClient.patch(`/employer/jobs/${id}/status`, { status });
        }
        affected += 1;
      } catch {
        failed.push(id);
      }
    }

    return { success: failed.length === 0, affected, failed };
  },
};
