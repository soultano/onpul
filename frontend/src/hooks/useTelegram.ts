import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function useTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  useEffect(() => {
    if (tg) {
      tg.ready();
      if (tg.expand) tg.expand();
    }
  }, [tg]);

  const haptics = {
    impact: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      try {
        tg?.HapticFeedback?.impactOccurred(style);
      } catch (e) {}
    }, [tg]),
    notification: useCallback((type: 'error' | 'success' | 'warning') => {
      try {
        tg?.HapticFeedback?.notificationOccurred(type);
      } catch (e) {}
    }, [tg]),
    selection: useCallback(() => {
      try {
        tg?.HapticFeedback?.selectionChanged();
      } catch (e) {}
    }, [tg]),
  };

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (!tg?.MainButton) return;
    tg.MainButton.text = text;
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (!tg?.MainButton) return;
    tg.MainButton.hide();
  }, [tg]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (!tg?.BackButton) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (!tg?.BackButton) return;
    tg.BackButton.hide();
  }, [tg]);

  const initData = tg?.initData || '';
  const user = tg?.initDataUnsafe?.user || {
    id: 77712345,
    first_name: 'Нодирбек',
    username: 'nodir_finance',
  };

  return {
    tg,
    initData,
    user,
    haptics,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    isDark: tg?.colorScheme === 'dark',
  };
}
