import React from 'react';

interface TaskPlannerProps {
  taskSequence: string[];
}

const TaskPlanner: React.FC<TaskPlannerProps> = ({ taskSequence }) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-2">
        {taskSequence.map((task, index) => (
          <div 
            key={index} 
            className="flex items-center"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 border border-secondary-500">
              {index + 1}
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-md flex-grow">
              {task}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPlanner;
