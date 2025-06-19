const targetMinutes = [1, 16, 31, 46];

async function ensureOffscreen() {
  if (!chrome.offscreen) return;
  const has = await chrome.offscreen.hasDocument?.();
  if (!has) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play ping sound'
    });
  }
}

function checkTime() {
  const now = new Date();
  const mins = now.getMinutes();
  const secs = now.getSeconds();

  if (targetMinutes.includes(mins) && secs === 55) {
    chrome.storage.local.get(["pingerActive"], async (result) => {
      if (result.pingerActive ?? true) {
        chrome.runtime.sendMessage({ ping: true });
        await ensureOffscreen();
        chrome.runtime.sendMessage({ playPing: true });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "15-Minute Ping",
          message: "Almost time! ⏰"
        });
      }
    });
  }
}

setInterval(checkTime, 1000);
