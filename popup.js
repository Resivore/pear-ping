const toggleInput = document.getElementById("toggle-input");
const stateText = document.getElementById("state-text");
const volumeSlider = document.getElementById("volume-slider");
const adjustVolumeBtn = document.getElementById("adjust-volume-btn");
const saveVolumeBtn = document.getElementById("save-volume-btn");
const pingAudio = document.getElementById("ping-audio");

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

function getVolume(cb) {
  if (storageLocal) {
    storageLocal.get(["pingVolume"], (res) => {
      cb(res.pingVolume ?? 1);
    });
  } else {
    const val = localStorage.getItem("pingVolume");
    cb(val === null ? 1 : parseFloat(val));
  }
}

function setVolume(vol, cb) {
  if (storageLocal) {
    storageLocal.set({ pingVolume: vol }, cb);
  } else {
    localStorage.setItem("pingVolume", vol);
    if (cb) cb();
  }
}

// Load state from storage
getState((isActive) => {
  stateText.textContent = isActive ? "Active" : "Paused";
  if (toggleInput) toggleInput.checked = isActive;
});

getVolume((vol) => {
  if (volumeSlider) volumeSlider.value = Math.round(vol * 100);
  if (pingAudio) pingAudio.volume = vol;
});

// Toggle state on click
toggleInput.addEventListener("change", () => {
  const next = toggleInput.checked;
  setState(next, () => {
    stateText.textContent = next ? "Active" : "Paused";
  });
});

volumeSlider.addEventListener("input", () => {
  const vol = volumeSlider.value / 100;
  if (pingAudio) pingAudio.volume = vol;
});

if (adjustVolumeBtn && saveVolumeBtn) {
  adjustVolumeBtn.addEventListener("click", () => {
    volumeSlider.style.display = "block";
    saveVolumeBtn.style.display = "block";
    adjustVolumeBtn.style.display = "none";
  });

  saveVolumeBtn.addEventListener("click", () => {
    const vol = volumeSlider.value / 100;
    if (pingAudio) pingAudio.volume = vol;
    setVolume(vol, () => {
      volumeSlider.style.display = "none";
      saveVolumeBtn.style.display = "none";
      adjustVolumeBtn.style.display = "block";
    });
  });
}

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
          if (pingAudio)
            pingAudio.play().catch((e) => console.error("Audio error:", e));
        }
      });
    }
  });
}
