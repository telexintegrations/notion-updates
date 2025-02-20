export type TaskPriority = 'High' | 'Medium' | 'Low';

export const PRIORITY_THRESHOLDS: Record<TaskPriority | 'default', number> = {
   'High': 3,
    'Medium': 5,
    'Low': 7,
    'default': 5 
};