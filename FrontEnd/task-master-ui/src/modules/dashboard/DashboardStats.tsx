import React from 'react';
import { Statistic, Button, Input, Row, Col, ConfigProvider, theme as antdTheme } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Task } from '../../types/Task';
import { usePreferences } from '../../context/PreferenceContext';
import '../../styles/DashboardStats.css';

interface DashboardStatsProps {
  tasks: Task[];
  onAddTask: () => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatsClick: (status: string) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks = [], onAddTask, searchTerm, onSearchChange, onStatsClick }) => {
  const { theme } = usePreferences();
  const todoCount = tasks ? tasks.filter(task => task.status === 'To Do').length : 0;
  const inProgressCount = tasks ? tasks.filter(task => task.status === 'In Progress').length : 0;
  const completedCount = tasks ? tasks.filter(task => task.status === 'Done').length : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'To Do':
        return '#ffc003';
      case 'In Progress':
        return '#0088f7';
      case 'Done':
        return '#00ff08';
      default:
        return '#fff';
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div className={`stats ${theme}`}>
        <Row gutter={16} className="stats-row">
          <Col span={8} onClick={() => onStatsClick('To Do')} style={{ cursor: 'pointer', color: getStatusStyle('To Do') }}>
            <Statistic title="To Do" value={todoCount} />
          </Col>
          <Col span={8} onClick={() => onStatsClick('In Progress')} style={{ cursor: 'pointer', color: getStatusStyle('In Progress') }}>
            <Statistic title="In Progress" value={inProgressCount} />
          </Col>
          <Col span={8} onClick={() => onStatsClick('Done')} style={{ cursor: 'pointer', color: getStatusStyle('Done') }}>
            <Statistic title="Completed" value={completedCount} />
          </Col>
        </Row>
        <Row gutter={16} className="search-add-row">
          <Col span={20}>
            <Input
              placeholder="Search tasks"
              value={searchTerm}
              onChange={onSearchChange}
              suffix={<SearchOutlined />}
              className={`search-input ${theme}`}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<PlusOutlined />} shape="circle" onClick={onAddTask} />
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default DashboardStats;
