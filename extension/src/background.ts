chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
  // sidePanel API may be unavailable in older Chromium builds
});
