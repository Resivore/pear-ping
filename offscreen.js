const audio = document.getElementById('offscreen-audio');

const storageLocal =
  typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
    ? chrome.storage.local
    : null;

function getVolume(cb) {
  if (storageLocal) {
    storageLocal.get(['pingVolume'], (res) => {
      cb(res.pingVolume ?? 1);
    });
  } else {
    const val = localStorage.getItem('pingVolume');
    cb(val === null ? 1 : parseFloat(val));
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.playPing) {
    getVolume((vol) => {
      audio.volume = vol;
      audio.play().catch((e) => console.error('Offscreen audio error:', e));
    });
  }
});
