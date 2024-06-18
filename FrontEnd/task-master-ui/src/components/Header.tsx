import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Drawer, Typography } from 'antd';
import { UserOutlined, EditOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferenceContext'; // Import the context
import logo from '../logo.svg'; // Ensure this path is correct
import '../styles/Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();
  const { theme } = usePreferences(); // Use the theme from context

  // Fetch user data from local storage when the component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
  }, []);

  // Show the drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // Close the drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Handle menu item clicks
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // Remove tokens from local storage and navigate to the home page
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/');
    } else {
      // Navigate to the selected page
      navigate(`/${key}`);
    }
    closeDrawer();
  };

  return (
    <AntHeader className={`app-header ${theme}-theme`}>
      <div className="logo">
        <img src={logo} alt="EasyTask Logo" className="logo-img" />
        <Title level={3} className="app-name">EasyTask</Title>
      </div>
      <div className="profile-icon" onClick={showDrawer}>
        <Avatar
          size={40}
          icon={<UserOutlined />}
          src={user.profile.profile_picture_data}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <Drawer
        title={`Hello, ${user.full_name || 'User'}`}
        placement="right"
        closable={true}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <Menu onClick={handleMenuClick}>
          <Menu.Item key="profile" icon={<EditOutlined />}>
            View/Edit Profile
          </Menu.Item>
          <Menu.Item key="preferences" icon={<SettingOutlined />}>
            Preferences
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            Logout
          </Menu.Item>
        </Menu>
      </Drawer>
    </AntHeader>
  );
};

export default Header;
