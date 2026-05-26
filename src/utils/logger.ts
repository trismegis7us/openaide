/**
 * Creates a logger that only outputs when verbose mode is enabled.
 * @param {boolean} verbose
 * @returns {{ info: (...args: any[]) => void }}
 */
export function createLogger(verbose) {
  return {
    info: (...args) => {
      if (verbose) console.info(...args);
    },
  };
}
