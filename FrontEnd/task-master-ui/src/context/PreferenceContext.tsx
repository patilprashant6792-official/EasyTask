// src/context/PreferencesContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

interface PreferencesContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const savedTheme = storedUser?.profile?.theme || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.profile = { ...storedUser.profile, theme };
    localStorage.setItem('user', JSON.stringify(storedUser));
  }, [theme]);

  const themeConfig = theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ConfigProvider theme={{ algorithm: themeConfig }}>
      <PreferencesContext.Provider value={{ theme, setTheme }}>
        {children}
      </PreferencesContext.Provider>
    </ConfigProvider>
  );
};

export const usePreferences = () => {
  const context = React.useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
