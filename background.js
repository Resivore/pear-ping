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

function getNextPingTime() {
  const now = new Date();
  const candidates = targetMinutes.map((m) => {
    const t = new Date(now);
    t.setMinutes(m);
    t.setSeconds(55);
    t.setMilliseconds(0);
    if (t <= now) t.setHours(t.getHours() + 1);
    return t;
  });
  candidates.sort((a, b) => a - b);
  return candidates[0];
}

  function scheduleNextPing() {
  if (!chrome.alarms) return;
  const next = getNextPingTime();
  chrome.alarms.clear('pingAlarm', () => {
    chrome.alarms.create('pingAlarm', { when: next.getTime() });
  });
}

chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'pingAlarm') return;
  chrome.storage.local.get(['pingerActive'], async (result) => {
    if (result.pingerActive ?? true) {
      chrome.runtime.sendMessage({ ping: true });
      await ensureOffscreen();
      chrome.runtime.sendMessage({ playPing: true });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Pear Ping',
        message: 'Grab your pears! 🍐',
      });
    }
  });
  scheduleNextPing();
});

scheduleNextPing();
