import React from 'react';
import { Card, Radio, Typography, Button, message, ConfigProvider, theme as antdTheme } from 'antd';
import { usePreferences } from '../context/PreferenceContext';
import { BulbOutlined, BulbFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import '../styles/Preferences.css';

const { Title } = Typography;

const Preferences: React.FC = () => {
  const { theme, setTheme } = usePreferences();

  const handleThemeChange = async (e: any) => {
    const newTheme = e.target.value;
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...storedUser, profile: { ...storedUser.profile, theme: newTheme } };

    try {
      const formData = new FormData();
      formData.append('user_id', updatedUser.user_id);
      formData.append('profile_picture_base64', updatedUser.profile.profile_picture_data || '');
      formData.append('bio', updatedUser.profile.bio || '');
      formData.append('theme', newTheme);

      const response = await axios.post(`/user/update-profile`, formData);

      if (response.data.status === 'success') {
        setTheme(newTheme);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        message.error('Failed to update theme.');
      }
    } catch (error) {
      message.error('Failed to update theme.');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div className={`preferences-container ${theme}-theme`}>
        <Link to="/dashboard">
          <Button type="link" icon={<ArrowLeftOutlined />} style={{ marginBottom: '1rem' }}>
            Back to Dashboard
          </Button>
        </Link>
        <Card
          title={<Title level={4}>Preferences</Title>}
          className={`preferences-card ${theme}-theme`}
        >
          <Title level={5}>Theme</Title>
          <Radio.Group onChange={handleThemeChange} value={theme} className="theme-radio-group">
            <Radio value="light" className="ant-radio-wrapper-light">
              <BulbOutlined style={{ color: '#fadb14', marginRight: 8 }} />
              Light
            </Radio>
            <Radio value="dark" className="ant-radio-wrapper-dark">
              <BulbFilled style={{ color: '#1890ff', marginRight: 8 }} />
              Dark
            </Radio>
          </Radio.Group>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Preferences;
