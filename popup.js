const toggleBtn = document.getElementById("toggle-btn");
const stateText = document.getElementById("state-text");

// Load state from storage
chrome.storage.local.get(["pingerActive"], (result) => {
  const isActive = result.pingerActive ?? true;
  stateText.textContent = isActive ? "Active" : "Paused";
});

// Toggle state on click
toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["pingerActive"], (result) => {
    const isActive = !(result.pingerActive ?? true);
    chrome.storage.local.set({ pingerActive: isActive }, () => {
      stateText.textContent = isActive ? "Active" : "Paused";
    });
  });
});

// Play sound if message received AND active
chrome.runtime.onMessage.addListener((request) => {
  if (request.ping) {
    chrome.storage.local.get(["pingerActive"], (result) => {
      if (result.pingerActive ?? true) {
        const audio = document.getElementById("ping-audio");
        if (audio) audio.play().catch((e) => console.error("Audio error:", e));
      }
    });
  }
});
