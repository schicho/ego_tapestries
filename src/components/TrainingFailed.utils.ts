const DEFAULT_REDIRECT_DELAY = 10000;

/**
 * Sends the participant to the given URL once their rejection has been saved (or failed to save) and the delay has passed.
 * Returns a function that cancels the redirect.
 */
export function scheduleTrainingFailedRedirect(
  rejection: Promise<unknown>,
  url: string,
  delay: number = DEFAULT_REDIRECT_DELAY,
  redirect: (target: string) => void = (target) => window.location.replace(target),
) {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  rejection
    .catch(() => undefined)
    .then(() => {
      if (!cancelled) {
        timeoutId = setTimeout(() => redirect(url), delay);
      }
    });

  return () => {
    cancelled = true;
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  };
}
