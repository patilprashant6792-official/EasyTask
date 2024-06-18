import React from 'react';
import { Form, Input, Button, Radio, ConfigProvider, theme as antdTheme } from 'antd';
import { Task } from '../../types/Task';
import { usePreferences } from '../../context/PreferenceContext';
import '../../styles/TaskForm.css';

interface TaskFormProps {
  form: any;
  selectedTask: Task | null;
  onFinish: (values: any) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ form, selectedTask, onFinish }) => {
  const { theme } = usePreferences();

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <Form form={form} layout="vertical" onFinish={onFinish} className={`task-form ${theme}`}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please provide a title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Radio.Group>
            <Radio value="To Do">To Do</Radio>
            <Radio value="In Progress">In Progress</Radio>
            <Radio value="Done">Done</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {selectedTask ? 'Update Task' : 'Create Task'}
          </Button>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
};

export default TaskForm;
