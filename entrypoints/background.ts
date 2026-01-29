export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    let mode: 'normal' | 'pro';
    if (command === 'switch-normal') {
      mode = 'normal';
    } else if (command === 'switch-pro') {
      mode = 'pro';
    } else {
      return;
    }

    try {
      await browser.tabs.sendMessage(tab.id, { action: 'switchModel', mode });
    } catch {
      // Content script not loaded on this page
    }
  });

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'getShortcuts') {
      browser.commands.getAll().then((commands) => {
        const shortcuts: Record<string, string> = {};
        for (const cmd of commands) {
          if (cmd.name && cmd.shortcut) {
            shortcuts[cmd.name] = cmd.shortcut;
          }
        }
        sendResponse(shortcuts);
      });
      return true;
    }
  });
});
