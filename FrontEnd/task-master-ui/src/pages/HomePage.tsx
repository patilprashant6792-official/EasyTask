import React, { useEffect } from 'react';
import axios from 'axios';
import { Layout, Row, Col, Card, Form, Input, Button, Typography, message, ConfigProvider, theme as antdTheme } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined, LoginOutlined } from '@ant-design/icons';
import '../styles/HomePage.css';
import config from '../config.json';

const { Content, Footer } = Layout;
const { Title, Text, Link } = Typography;

const HomePage: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('Token retrieved from localStorage on mount:', token);  // Debugging log
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/user/login`, {
        email: values.username,
        password: values.password,
      });

      if (response.data.status === 'success') {
        message.success('Login successful');
        const { access_token, refresh_token, user } = response.data.data;
        console.log('Access Token:', access_token);  // Debugging log
        console.log('Refresh Token:', refresh_token);  // Debugging log
        console.log('User Data:', JSON.stringify(user));  // Debugging log
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Token stored in localStorage:', localStorage.getItem('access_token'));  // Debugging log
        window.location.href = '/dashboard';
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed. Please try again.');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm }}>
      <Layout className="homepage-layout">
        <Content className="content">
          <Row gutter={[16, 16]} justify="center">
            <Col span={24} style={{ textAlign: 'center' }}>
              <Title level={2} className="title">EasyTask</Title>
              <Text>Your ultimate solution for easy task management</Text>
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: '20px', width: '100%' }}>
            <Col xs={24} md={12}>
              <Card className="card-shadow">
                <Form name="login" className="login-form" onFinish={onFinish}>
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your Username!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                  >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                  </Form.Item>
                  <Text>
                    <Link href="/forgot">Forgot Password?</Link>
                  </Text>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }} className="login-form-button" icon={<LoginOutlined />}>
                      Login
                    </Button>
                  </Form.Item>
                </Form>
                <Text>
                  New here? <Link href="/register">Register</Link> and start managing your tasks effortlessly!
                </Text>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: '40px' }}>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Title level={3}>Features</Title>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<span><CheckCircleOutlined /> Easy Task Management</span>} bordered={false} className="card-shadow">
                <Text>Organize and manage your tasks with ease. Track your progress and never miss a deadline.</Text>
              </Card>
            </Col>
          </Row>
        </Content>
        <Footer className="footer">EasyTask ©2024 Created by Prashant</Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;
