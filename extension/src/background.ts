const APP_PAGE = 'sidepanel.html';

async function openAppTab() {
  const url = chrome.runtime.getURL(APP_PAGE);
  const base = url.split('?')[0];
  const tabs = await chrome.tabs.query({ url: `${base}*` });

  const existing = tabs.find((t) => t.url?.startsWith(base));
  if (existing?.id != null) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId != null) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    return;
  }

  await chrome.tabs.create({ url });
}

chrome.action.onClicked.addListener(() => {
  openAppTab().catch(console.error);
});
