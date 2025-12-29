interface TaskDetailsPageProps {
  params: {
    id: string;
    taskId: string;
  };
}

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Task Details</h1>
      <p className="text-gray-500">Task ID: {params.taskId}</p>
    </div>
  );
}
