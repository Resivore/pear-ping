const targetMinutes = [1, 16, 31, 46];

function checkTime() {
  const now = new Date();
  const mins = now.getMinutes();
  const secs = now.getSeconds();

  if (targetMinutes.includes(mins) && secs === 55) {
    chrome.storage.local.get(["pingerActive"], (result) => {
      if (result.pingerActive ?? true) {
        chrome.runtime.sendMessage({ ping: true });
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
