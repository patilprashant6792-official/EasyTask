import React from 'react';
import { Form, Input, Button, Layout, Typography, message, ConfigProvider, theme as antdTheme } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from '../axiosConfig';
import '../styles/ForgotPassword.css';
import config from '../config.json';

const { Title, Text, Link } = Typography;
const { Content, Footer } = Layout;

const strongPasswordRules = [
  { required: true, message: 'Please input your password!' },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
  },
];

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();

  const handleResetPassword = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    try {
      await axios.post(`${config.API_BASE_URL}/user/reset-password`, {
        email: values.email,
        new_password: values.password,
      });
      message.success('Password reset successfully!');
      window.location.href = '/';
    } catch (error) {
      message.error('Email not found. Please check your email and try again.');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm }}>
      <Layout className="forgot-password-layout">
        <Content className="content">
          <Title level={2} className="title">Reset Password</Title>
          <Form form={form} name="reset_password" onFinish={handleResetPassword}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={strongPasswordRules}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your new Password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Reset Password
              </Button>
              <Text style={{ color: '#ccc' }}>
                 <Link href="/" style={{ color: '#1890ff' }}>Back to login</Link>
                </Text>
            </Form.Item>
          </Form>
        </Content>
        <Footer className="footer">TaskMaster ©2024 Created by Prashant</Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default ForgotPassword;
