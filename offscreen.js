chrome.runtime.onMessage.addListener((msg) => {
  if (msg.playPing) {
    const audio = document.getElementById('offscreen-audio');
    audio.play().catch((e) => console.error('Offscreen audio error:', e));
  }
});
