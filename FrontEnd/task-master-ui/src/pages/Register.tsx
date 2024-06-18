import React, { useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, Row, Col, Layout, message, ConfigProvider, theme as antdTheme } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import config from '../config.json';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

const Register: React.FC = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  const onFinish = async (values: any) => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/user/register`, values);
      if (response.data.status === 'success') {
        message.success(response.data.data.message);
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        window.location.href = '/dashboard';
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Registration failed. Please try again.');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
    },
    pattern: {
      mismatch: '${label} does not meet the criteria!',
    },
    password: {
      confirm: 'Passwords do not match!',
    },
  };

  const strongPasswordRules = [
    { required: true, message: 'Please input your password!' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm }}>
      <Layout style={{ minHeight: '100vh', justifyContent: 'center', background: '#141414' }}>
        <Content>
          <Row justify="center">
            <Col xs={22} sm={20} md={16} lg={12} xl={8}>
              <div style={{ padding: '2rem', background: '#1f1f1f', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', borderRadius: '8px', marginTop: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <Title level={2} style={{ color: '#fff' }}>EasyTask</Title>
                  <Text type="secondary" style={{ color: '#ccc' }}>Register with us to get started</Text>
                </div>
                <Form
                  form={form}
                  name="register"
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  validateMessages={validateMessages}
                >
                  <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[{ required: true }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                  </Form.Item>

                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[{ required: true }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true },
                      { type: 'email' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                  </Form.Item>

                  <Text type="secondary" style={{ display: 'block', marginBottom: '1rem', color: '#ccc' }}>Note: Your email ID will be your Login id.</Text>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={strongPasswordRules}
                    hasFeedback
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
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
                    <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
                  </Form.Item>

                  <Form.Item style={{ marginTop: '1.5rem' }}>
                    <Button type="primary" htmlType="submit" block>
                      Register
                    </Button>
                  </Form.Item>
                </Form>
                <Text style={{ color: '#ccc' }}>
                  Already have an account? <Link href="/" style={{ color: '#1890ff' }}>Click here to login</Link>
                </Text>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Register;
