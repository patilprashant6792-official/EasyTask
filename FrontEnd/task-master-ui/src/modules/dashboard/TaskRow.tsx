import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { Task } from '../../types/Task';
import { usePreferences } from '../../context/PreferenceContext';
import { ClockCircleOutlined, FileDoneOutlined, SyncOutlined, CheckOutlined } from '@ant-design/icons';
import { ConfigProvider, theme as antdTheme } from 'antd';
import '../../styles/TaskRow.css';

interface TaskRowProps {
  id: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (task: Task, newStatus: string) => void;
}

const getStatusIcon = (title: string) => {
  switch (title) {
    case 'To Do':
      return <FileDoneOutlined />;
    case 'In Progress':
      return <SyncOutlined />;
    case 'Done':
      return <CheckOutlined />;
    default:
      return null;
  }
};

const getTitleStyle = (title: string) => {
  switch (title) {
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

const TaskRow: React.FC<TaskRowProps> = ({ id, title, tasks = [], onEditTask, onDeleteTask, onStatusChange }) => {
  const { theme } = usePreferences(); // Use the theme from context
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <ConfigProvider theme={{ algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div ref={setNodeRef} className={`task-row ${theme}`}>
        <h2 className="task-row-title" style={getTitleStyle(title)}>
          {getStatusIcon(title)} <span>&nbsp;&nbsp;&nbsp;{title}</span>
        </h2>
        <div className="task-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.task_id}
                task={task}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <p className="no-tasks">No tasks available</p>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

interface DraggableTaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (task: Task, newStatus: string) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, onEditTask, onDeleteTask, onStatusChange }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.task_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        id={task.task_id}
        title={task.title}
        status={task.status}
        description={task.description}
        updated_at={task.updated_at}
        remindAt={task.remindAt}
        onClick={() => onEditTask(task)}
        onDelete={() => onDeleteTask(task.task_id)}
        onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
      />
    </div>
  );
};

export default TaskRow;
