import React from 'react';
import { Layout, ConfigProvider, theme as antdTheme } from 'antd';
import AppHeader from './Header';
import { usePreferences } from '../context/PreferenceContext';
import '../styles/MasterLayout.css';

const { Content } = Layout;

interface MasterLayoutProps {
  children: React.ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
  const { theme } = usePreferences();

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <Layout className={` ${theme}-theme`}>
        <AppHeader />
        <Content className="content">{children}</Content>
      </Layout>
    </ConfigProvider>
  );
};

export default MasterLayout;
