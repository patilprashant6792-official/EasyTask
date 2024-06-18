import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Layout, Avatar, Descriptions, Button, Upload, message, Input, ConfigProvider, theme as antdTheme } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { usePreferences } from '../context/PreferenceContext'; // Import the context
import '../styles/UserProfile.css'; // Import the CSS file

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  const { theme } = usePreferences(); // Use the theme from context

  useEffect(() => {
    // Fetch user data from local storage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    setBio(storedUser.profile.bio || '');
    setProfilePicture(storedUser.profile.profile_picture_data);
  }, []);

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        const formData = new FormData();
        formData.append('user_id', user.user_id);
        if (profilePicture) {
          // Extract base64 string without the prefix
          const base64String = profilePicture.split(',')[1];
          formData.append('profile_picture_base64', base64String);
        }
        formData.append('bio', bio);
        formData.append('theme', user.profile.theme);

        const response = await axios.post('/user/update-profile', formData);

        if (response.data.status === 'success') {
          const updatedUser = { ...user, profile: { ...user.profile, bio, profile_picture_data: profilePicture } };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          message.success('Profile updated successfully.');
        } else {
          message.error('Failed to update profile.');
        }
      } catch (error) {
        message.error('Failed to update profile.');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          setProfilePicture(`data:image/jpeg;base64,${base64}`);
        }
      };
      reader.readAsDataURL(info.file.originFileObj);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error('Image must be smaller than 1MB!');
      }
      return isJpgOrPng && isLt1M;
    },
    showUploadList: false,
    customRequest: ({ file, onSuccess }: any) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
  };

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <Layout className={`user-profile-layout ${theme}-theme`}>
        <Content className={`user-profile-content ${theme}-theme`}>
          <Link to="/dashboard">
            <Button type="link" icon={<ArrowLeftOutlined />} className={`back-button ${theme}-theme`}>
              Back to Dashboard
            </Button>
          </Link>
          <Row justify="center" style={{ marginTop: '2rem' }}>
            <Col xs={22} sm={20} md={16} lg={12} xl={8}>
              <div className={`profile-container ${theme}-theme`}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  {isEditing ? (
                    <Upload {...uploadProps} onChange={handleUploadChange}>
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={profilePicture}
                        className="profile-avatar"
                      />
                    </Upload>
                  ) : (
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      src={profilePicture}
                      className="profile-avatar"
                    />
                  )}
                  <Title level={2} className="profile-title">{user.full_name}</Title>
                </div>
                <Descriptions bordered column={1} className={`profile-descriptions ${theme}-theme`}>
                  <Descriptions.Item label="Full Name" className="profile-description-item">{user.full_name}</Descriptions.Item>
                  <Descriptions.Item label="Email" className="profile-description-item">
                    <MailOutlined style={{ marginRight: '8px' }} />
                    {user.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone Number" className="profile-description-item">
                    <PhoneOutlined style={{ marginRight: '8px' }} />
                    {user.phone_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bio" className="profile-description-item">
                    {isEditing ? (
                      <TextArea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                    ) : (
                      <Text>{bio}</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
                <div className="edit-button">
                  <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>
                    {isEditing ? 'Save' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default UserProfile;
