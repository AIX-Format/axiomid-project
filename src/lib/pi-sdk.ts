let piSdkLoadPromise: Promise<void> | null = null;

function injectPiSdkScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pi SDK"));
    document.body.appendChild(script);
  });
}

export function ensurePiSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Not in browser"));
  }
  if (window.Pi) {
    return Promise.resolve();
  }
  if (!piSdkLoadPromise) {
    piSdkLoadPromise = injectPiSdkScript();
  }
  return piSdkLoadPromise;
}
