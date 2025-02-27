type Task = {
  id: string
  title: string
  completed: boolean
  profileId: string
}

export const fetchTasks = async (profileId: string | null): Promise<Task[]> => {
  // TODO: Implement actual API call
  return []
}

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  // TODO: Implement actual API call
  return {
    id: Date.now().toString(),
    ...task
  }
} 