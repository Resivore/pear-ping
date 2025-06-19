const toggleInput = document.getElementById("toggle-input");
const stateText = document.getElementById("state-text");

// helper storage functions with localStorage fallback
// robustly access chrome.storage.local if available
const storageLocal =
  typeof chrome !== "undefined" &&
  chrome.storage &&
  chrome.storage.local
    ? chrome.storage.local
    : null;

function getState(cb) {
  if (storageLocal) {
    storageLocal.get(["pingerActive"], (res) => {
      cb(res.pingerActive ?? true);
    });
  } else {
    const val = localStorage.getItem("pingerActive");
    cb(val === null ? true : val === "true");
  }
}

function setState(active, cb) {
  if (storageLocal) {
    storageLocal.set({ pingerActive: active }, cb);
  } else {
    localStorage.setItem("pingerActive", active);
    if (cb) cb();
  }
}

// Load state from storage
getState((isActive) => {
  stateText.textContent = isActive ? "Active" : "Paused";
  if (toggleInput) toggleInput.checked = isActive;
});

// Toggle state on click
toggleInput.addEventListener("change", () => {
  const next = toggleInput.checked;
  setState(next, () => {
    stateText.textContent = next ? "Active" : "Paused";
  });
});

// Play sound if message received AND active
if (
  typeof chrome !== "undefined" &&
  chrome.runtime &&
  chrome.runtime.onMessage
) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.ping) {
      getState((isActive) => {
        if (isActive) {
          const audio = document.getElementById("ping-audio");
          if (audio)
            audio.play().catch((e) => console.error("Audio error:", e));
        }
      });
    }
  });
}
