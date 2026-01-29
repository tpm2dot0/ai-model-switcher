import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'AI Model Switcher',
    description: 'Quick switch AI models on ChatGPT, Claude, and Gemini with keyboard shortcuts',
    version: '1.0.0',
    icons: {
      16: '/icon-16.png',
      32: '/icon-32.png',
      48: '/icon-48.png',
      128: '/icon-128.png',
    },
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: [
      'https://chatgpt.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
    ],
    commands: {
      'switch-normal': {
        suggested_key: {
          default: 'Alt+1',
        },
        description: 'Switch to Normal mode',
      },
      'switch-pro': {
        suggested_key: {
          default: 'Alt+2',
        },
        description: 'Switch to Pro mode',
      },
    },
  },
});
