const audio = document.getElementById('offscreen-audio');

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.playPing) {
    audio.play().catch((e) => console.error('Offscreen audio error:', e));
  }
});
