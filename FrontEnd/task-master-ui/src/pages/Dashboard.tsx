import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Spin, Form, notification, Button, Drawer, Modal, ConfigProvider, theme as antdTheme } from 'antd';
import { debounce } from 'lodash';
import moment from 'moment';
import TaskRow from '../modules/dashboard/TaskRow';
import DashboardStats from '../modules/dashboard/DashboardStats';
import TaskForm from '../modules/dashboard/TaskForm';
import axiosInstance from '../axiosConfig';
import { Task } from '../types/Task';
import { usePreferences } from '../context/PreferenceContext';
import '../styles/Dashboard.css';

const { Content } = Layout;
const { confirm } = Modal;

const Dashboard: React.FC = () => {
  const { theme } = usePreferences();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const tasksPerPage = 20;

  const statuses = ['To Do', 'In Progress', 'Done'];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/task/search');
        const fetchedTasks = response?.data?.data || [];
        setTasks(fetchedTasks);
        setFilteredTasks(fetchedTasks);
      } catch (error) {
        handleError(error, 'Failed to fetch tasks.');
      }
    };
    fetchTasks();
  }, []);

  const debounceSearch = useCallback(
    debounce(async (value: string) => {
      try {
        const response = await axiosInstance.get(`/task/search?query=${value}`);
        const searchTasks = response?.data?.data || [];
        setFilteredTasks(searchTasks);
      } catch (error) {
        handleError(error, 'Failed to search tasks.');
      }
    }, 300),
    []
  );

  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  const handleSaveTask = async (values: any) => {
    let updatedTasks;
    try {
      if (selectedTask && selectedTask.task_id) {
        const response = await axiosInstance.put(`/task/${selectedTask.task_id}`, {
          ...values,
          remindAt: values.remindAt ? values.remindAt.toISOString() : null,
        });
        const updatedTask = response?.data?.data || {};
        updatedTasks = tasks.map((t) => (t.task_id === selectedTask.task_id ? updatedTask : t));
        notification.success({
          message: 'Success',
          description: 'Task updated successfully.',
        });


      setSelectedTask(null);
      } else {
        const response = await axiosInstance.post('/task/create', {
          ...values,
          remindAt: values.remindAt ? values.remindAt.toISOString() : null,
        });
        const newTask = response?.data?.data || {};
        updatedTasks = [...tasks, newTask];
        notification.success({
          message: 'Success',
          description: 'Task added successfully.',
        });
      }
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setIsDrawerVisible(false);
      setSelectedTask(null);
      form.resetFields();
    } catch (error) {
      handleError(error, 'Failed to save task.');
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    form.setFieldsValue({
      ...task,
      remindAt: task.remindAt ? moment(task.remindAt) : null,
    });
    setIsDrawerVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    confirm({
      title: 'Are you sure you want to delete this task?',
      content: `Task: ${tasks.find((task) => task.task_id === taskId)?.title}`,
      onOk: async () => {
        try {
          await axiosInstance.delete(`/task/${taskId}`);
          const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
          setTasks(updatedTasks);
          setFilteredTasks(updatedTasks);
          notification.success({
            message: 'Success',
            description: 'Task deleted successfully.',
          });
        } catch (error) {
          handleError(error, 'Failed to delete task.');
        }
      },
    });
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    const updatedTask = { ...task, status: newStatus };
    try {
      await axiosInstance.put(`/task/${updatedTask.task_id}`, updatedTask);
      const updatedTasks = tasks.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t));
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
    } catch (error) {
      handleError(error, 'Failed to update task status.');
    }
  };

  const handleStatsClick = async (status: string) => {
    try {
      const response = await axiosInstance.get(`/task/search?query=${status}`);
      const searchTasks = response?.data?.data || [];
      setFilteredTasks(searchTasks);
    } catch (error) {
      handleError(error, `Failed to fetch tasks with status ${status}.`);
    }
  };

  const handleError = (error: any, defaultMessage: string) => {
    const message = error?.response?.status === 400 ? error.response.data.message : defaultMessage;
    notification.error({
      message: 'Error',
      description: message,
    });
  };

  const noTasks = tasks.length === 0;

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <Layout className={`dashboard-layout ${theme}`}>
        <Content className="dashboard-content">
          <div className="content">
            <DashboardStats
              tasks={tasks}
              onAddTask={() => setIsDrawerVisible(true)}
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              onStatsClick={handleStatsClick}
            />
            {noTasks ? (
              <div className="no-tasks-message">
                <p>No tasks added yet. <Button type="primary" onClick={() => setIsDrawerVisible(true)}>Add a New Task</Button></p>
              </div>
            ) : (
              statuses.map((status) => {
                const statusTasks = filteredTasks.filter((task) => task.status === status);
                if (statusTasks.length === 0) return null;
                return (
                  <TaskRow
                    key={status}
                    id={status.toLowerCase().replace(/\s+/g, '-')}
                    title={status}
                    tasks={statusTasks}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                );
              })
            )}
            {loading && <Spin className="loading-spinner" />}
          </div>
          <Drawer
            title={selectedTask ? 'Edit Task' : 'Create Task'}
            placement="right"
            closable={true}
            onClose={() => setIsDrawerVisible(false)}
            open={isDrawerVisible}
            width={400}
          >
            <TaskForm form={form} selectedTask={selectedTask} onFinish={handleSaveTask} />
          </Drawer>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;
