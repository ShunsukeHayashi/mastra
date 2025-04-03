import React from 'react';

interface MicroTask {
  id: string;
  detail: string;
  dt: string;
  assigned_agent: string;
}

interface MicroTaskListProps {
  microTasks: MicroTask[];
}

const MicroTaskList: React.FC<MicroTaskListProps> = ({ microTasks }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {microTasks.map((task) => (
        <div key={task.id} className="microtask-item">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded mr-2">
                {task.id}
              </span>
              <span className="text-sm font-medium">{task.detail}</span>
            </div>
            <span className="text-xs text-slate-400">
              {formatDate(task.dt)}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xs text-secondary-400">担当: </span>
            <span className="text-xs bg-secondary-900 text-secondary-300 px-2 py-0.5 rounded">
              {task.assigned_agent}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MicroTaskList;
