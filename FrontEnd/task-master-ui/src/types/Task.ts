export interface Task {
    task_id: string;
    title: string;
    status: string;
    description: string;
    remindAt?: string;
    sequence: number;
    updated_at:string
  }