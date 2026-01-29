// AI Model Switcher Content Script
// Handles model switching on ChatGPT, Claude, and Gemini

interface AIConfig {
  dropdownSelector: string | (() => Element | null);
  models: {
    normal: { text?: string; selector?: string };
    pro: { text?: string; selector?: string };
  };
  getMenuItem: (model: { text?: string; selector?: string }) => Element | null;
}

const AI_CONFIGS: Record<string, AIConfig> = {
  'chatgpt.com': {
    dropdownSelector: '[data-testid="model-switcher-dropdown-button"]',
    models: {
      normal: { text: 'Instant' },
      pro: { text: 'Thinking' },
    },
    getMenuItem: (model) => {
      const items = document.querySelectorAll('[role="menuitem"]');
      return Array.from(items).find((i) =>
        i.textContent?.includes(model.text || '')
      ) || null;
    },
  },
  'claude.ai': {
    dropdownSelector: '[data-testid="model-selector-dropdown"]',
    models: {
      normal: { text: 'Sonnet' },
      pro: { text: 'Opus' },
    },
    getMenuItem: (model) => {
      const items = document.querySelectorAll('[role="menuitem"]');
      return Array.from(items).find((i) =>
        i.textContent?.includes(model.text || '')
      ) || null;
    },
  },
  'gemini.google.com': {
    dropdownSelector: () => {
      const buttons = document.querySelectorAll('button');
      return (
        Array.from(buttons).find((btn) => {
          const text = btn.textContent?.toLowerCase() || '';
          return (
            (text.includes('fast') ||
              text.includes('pro') ||
              text.includes('thinking')) &&
            btn.getBoundingClientRect().y > 200
          );
        }) || null
      );
    },
    models: {
      normal: { selector: '[data-test-id="bard-mode-option-fast"]' },
      pro: { selector: '[data-test-id="bard-mode-option-pro"]' },
    },
    getMenuItem: (model) => {
      if (model.selector) {
        return document.querySelector(model.selector);
      }
      return null;
    },
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function switchModel(mode: 'normal' | 'pro'): Promise<{ success: boolean; message: string }> {
  const hostname = window.location.hostname;
  const config = AI_CONFIGS[hostname];

  if (!config) {
    return { success: false, message: 'Unsupported website' };
  }

  // Get dropdown button
  const dropdown =
    typeof config.dropdownSelector === 'function'
      ? config.dropdownSelector()
      : document.querySelector(config.dropdownSelector);

  if (!dropdown) {
    return { success: false, message: 'Model selector not found' };
  }

  // Click to open menu
  (dropdown as HTMLElement).click();
  await sleep(350);

  // Click model option
  const modelConfig = config.models[mode];
  const menuItem = config.getMenuItem(modelConfig);

  if (menuItem) {
    (menuItem as HTMLElement).click();
    return {
      success: true,
      message: `Switched to ${mode === 'pro' ? 'Pro/Thinking' : 'Normal/Fast'} mode`,
    };
  }

  // Close menu if model not found
  (dropdown as HTMLElement).click();
  return { success: false, message: 'Model option not found' };
}

function getCurrentSite(): string | null {
  const hostname = window.location.hostname;
  if (hostname.includes('chatgpt.com')) return 'ChatGPT';
  if (hostname.includes('claude.ai')) return 'Claude';
  if (hostname.includes('gemini.google.com')) return 'Gemini';
  return null;
}

export default defineContentScript({
  matches: [
    'https://chatgpt.com/*',
    'https://claude.ai/*',
    'https://gemini.google.com/*',
  ],
  main() {
    // Listen for messages from popup or background
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'switchModel') {
        switchModel(message.mode).then(sendResponse);
        return true; // Indicates async response
      }
      if (message.action === 'getSiteInfo') {
        sendResponse({ site: getCurrentSite() });
        return true;
      }
    });
  },
});
