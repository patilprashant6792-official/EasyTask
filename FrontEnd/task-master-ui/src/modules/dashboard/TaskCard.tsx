import React from 'react';
import { Card, Tooltip } from 'antd';
import { ClockCircleOutlined, DeleteOutlined, CheckOutlined, SyncOutlined, FileDoneOutlined } from '@ant-design/icons';
import { usePreferences } from '../../context/PreferenceContext';
import { formatDistanceToNow } from 'date-fns';
import '../../styles/TaskCard.css';

interface TaskCardProps {
  id: string;
  title: string;
  status: string;
  description: string;
  remindAt?: string;
  updated_at: string; // Add updated_at prop
  onClick: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ id, title, status, description, remindAt, updated_at, onClick, onDelete, onStatusChange }) => {
  const { theme } = usePreferences(); // Use the theme from context

  const getCardClassName = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'task-card to-do';
      case 'In Progress':
        return 'task-card in-progress';
      case 'Done':
        return 'task-card done';
      default:
        return 'task-card';
    }
  };

  const getTitleStyle = (status: string) => {
    switch (status) {
      case 'To Do':
        return { color: '#ffc003' };
      case 'In Progress':
        return { color: '#0088f7' };
      case 'Done':
        return { color: '#00ff08' };
      default:
        return { color: '#fff' };
    }
  };

  const getStatusChangeIcons = () => {
    switch (status) {
      case 'To Do':
        return (
          <>
            <Tooltip title="Mark as In Progress">
              <SyncOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('In Progress'); }} style={{ color: '#0088f7' }} />
            </Tooltip>
            <Tooltip title="Mark as Done">
              <CheckOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('Done'); }} style={{ color: '#00ff08' }} />
            </Tooltip>
          </>
        );
      case 'In Progress':
        return (
          <>
            <Tooltip title="Mark as Done">
              <CheckOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('Done'); }} style={{ color: '#00ff08' }} />
            </Tooltip>
            <Tooltip title="Mark as To Do">
              <FileDoneOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('To Do'); }} style={{ color: '#ffc003' }} />
            </Tooltip>
          </>
        );
      case 'Done':
        return (
          <>
            <Tooltip title="Mark as In Progress">
              <SyncOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('In Progress'); }} style={{ color: '#0088f7' }} />
            </Tooltip>
            <Tooltip title="Mark as To Do">
              <FileDoneOutlined onClick={(e) => { e.stopPropagation(); onStatusChange('To Do'); }} style={{ color: '#ffc003' }} />
            </Tooltip>
          </>
        );
      default:
        return null;
    }
  };

  const formatUpdatedAt = (updated_at: string) => {
    const date = new Date(updated_at); // Parse date directly
    const timePassed = formatDistanceToNow(date, { addSuffix: true });
    return timePassed;
  };

  return (
    <Card
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`${getCardClassName(status)} ${theme}`}
      style={{ cursor: "pointer" }}
      title={
        <div className="card-header">
          <span className="task-title" style={getTitleStyle(status)}>{title}</span>
          <Tooltip title="Delete">
            <DeleteOutlined onClick={(e) => { e.stopPropagation(); onDelete(); }} className="delete-icon" />
          </Tooltip>
        </div>
      }
    >
      <p className="description">{description}</p>
      {remindAt && (
        <div className="reminder">
          <ClockCircleOutlined />
          <span className="reminder-date">{new Date(remindAt).toLocaleString()}</span>
        </div>
      )}
      <div className="updated-at">
        Last updated: {formatUpdatedAt(updated_at)}
      </div>
      <div className="status-icons">
        {getStatusChangeIcons()}
      </div>
    </Card>
  );
};

export default TaskCard;
