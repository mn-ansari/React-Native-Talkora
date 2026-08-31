export type BrowserSSOStatus =
  | "idle"
  | "pending"
  | "success"
  | "cancelled"
  | "error";

type BrowserSSOState = {
  errorMessage: string | null;
  status: BrowserSSOStatus;
};

const WAIT_INTERVAL_MS = 100;

let browserSSOState: BrowserSSOState = {
  errorMessage: null,
  status: "idle",
};

export function beginBrowserSSO() {
  browserSSOState = { errorMessage: null, status: "pending" };
}

export function completeBrowserSSO(
  status: Exclude<BrowserSSOStatus, "idle" | "pending">,
  errorMessage: string | null = null,
) {
  browserSSOState = { errorMessage, status };
}

export async function waitForBrowserSSO(timeoutMs: number) {
  const startedAt = Date.now();

  while (
    browserSSOState.status === "pending" &&
    Date.now() - startedAt < timeoutMs
  ) {
    await new Promise((resolve) => setTimeout(resolve, WAIT_INTERVAL_MS));
  }

  return browserSSOState;
}
