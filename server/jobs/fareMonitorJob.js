import {
  runFareMonitor
} from "../services/fareMonitor.js";

export function startFareMonitorJob({
  intervalMs =
    15 * 60 * 1000
} = {}) {
  const run =
    () =>
      runFareMonitor()
        .catch(
          (error) =>
            console.error(
              "[fare-monitor]",
              error.message
            )
        );

  const timer =
    setInterval(
      run,
      intervalMs
    );

  return {
    run,
    timer
  };
}
