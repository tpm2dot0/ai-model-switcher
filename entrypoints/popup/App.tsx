import { useState, useEffect } from 'react';

const MODEL_INFO = {
  ChatGPT: { normal: 'Instant', pro: 'Thinking' },
  Claude: { normal: 'Sonnet 4.5', pro: 'Opus 4.5' },
  Gemini: { normal: 'Fast', pro: 'Pro' },
};

const DEFAULT_SHORTCUTS: Record<string, string> = {
  'switch-normal': 'Alt+1',
  'switch-pro': 'Alt+2',
};

function App() {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(DEFAULT_SHORTCUTS);
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    browser.runtime.sendMessage({ action: 'getShortcuts' }).then((result: Record<string, string>) => {
      if (result && Object.keys(result).length > 0) {
        setShortcuts({ ...DEFAULT_SHORTCUTS, ...result });
      }
    });

    browser.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      if (tab?.id) {
        try {
          const response = await browser.tabs.sendMessage(tab.id, { action: 'getSiteInfo' });
          setCurrentSite(response?.site || null);
        } catch {
          setCurrentSite(null);
        }
      }
    });
  }, []);

  const handleSwitch = async (mode: 'normal' | 'pro') => {
    setStatus({ type: null, message: '' });
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus({ type: 'error', message: 'No active tab' });
      return;
    }
    try {
      const response = await browser.tabs.sendMessage(tab.id, { action: 'switchModel', mode });
      setStatus(response?.success
        ? { type: 'success', message: response.message }
        : { type: 'error', message: response?.message || 'Switch failed' }
      );
    } catch {
      setStatus({ type: 'error', message: 'Not on a supported AI site' });
    }
  };

  const siteModels = currentSite ? MODEL_INFO[currentSite as keyof typeof MODEL_INFO] : null;

  return (
    <div className="bg-white text-gray-900 min-w-[300px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-[#F4F3EE] flex items-center justify-center rounded-md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#2E2B5F">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight">AI Model Switcher</span>
      </div>

      {/* Site status */}
      <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
        {currentSite ? (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active on <strong className="text-gray-900">{currentSite}</strong>
          </span>
        ) : (
          <span>
            Supports <strong>ChatGPT</strong>, <strong>Claude</strong>, <strong>Gemini</strong>
          </span>
        )}
      </div>

      {/* Switch buttons */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSwitch('normal')}
            className="px-3 py-2.5 text-left border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium">Normal</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {siteModels?.normal ?? 'Fast response'}
            </div>
          </button>
          <button
            onClick={() => handleSwitch('pro')}
            className="px-3 py-2.5 text-left border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium">Pro</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {siteModels?.pro ?? 'Deep thinking'}
            </div>
          </button>
        </div>

        {status.type && (
          <div className={`px-3 py-2 text-xs animate-fade-in ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.message}
          </div>
        )}
      </div>

      {/* Shortcuts */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-gray-400">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 font-mono border border-gray-200">{shortcuts['switch-normal']}</kbd>
          {' / '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 font-mono border border-gray-200">{shortcuts['switch-pro']}</kbd>
        </span>
        <button
          onClick={() => browser.tabs.create({ url: 'chrome://extensions/shortcuts' })}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default App;
