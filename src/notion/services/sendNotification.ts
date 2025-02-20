import { sendEMail } from "../../notifications/nodemailer/sendMail";
import { ExtractedTask, TaskNotification } from "../types";
import { PRIORITY_THRESHOLDS } from "../constants/notifications.constant";

export const getDueDateTasks = async (tasks: ExtractedTask[]): Promise<Record<string, TaskNotification[]>> => {
    const today = new Date();

    const overdueTasks = tasks
        .filter(
            (task) => 
                task["Due date"] !== "No date" &&
                new Date(task["Due date"]) < today &&
                task.Status !== "Done" && 
                task.Assignee?.length > 0
        )
        .map((task) => ({
            task: task.Task,
            assignees: typeof task.Assignee === 'string'
                ? [{ name: task.Assignee, email: task.Assignee }]
                : (task.Assignee as { name: string; email: string }[])?.map(assignee => ({
                    name: assignee.name,
                    email: assignee.email
                })),
            dueDate: task["Due date"],
            status: "Overdue",
        }));

    const stuckTasks = tasks
        .filter((task) => {
            const daysInactive = Math.ceil(
                (today.getTime() - new Date(task.last_edited_time).getTime()) / (1000 * 60 * 60 * 24)
            );
            const priorityThreshold =
              PRIORITY_THRESHOLDS[
                task.Priority as keyof typeof PRIORITY_THRESHOLDS
              ] || PRIORITY_THRESHOLDS.default;

            return task.Status !== "Done" &&
                task["Due date"] !== "No date" &&
                task.Assignee?.length > 0 &&
                daysInactive > priorityThreshold;
        })
        .map((task) => ({
            task: task.Task,
            assignees: typeof task.Assignee === 'string'
                ? [{ name: task.Assignee, email: task.Assignee }]
                : (task.Assignee as { name: string; email: string }[])?.map(assignee => ({
                    name: assignee.name,
                    email: assignee.email
                })),
            status: task.Status,
            stuckForDays: Math.ceil(
                (today.getTime() - new Date(task.last_edited_time).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
        }));

    return {
        overdueTasks,
        stuckTasks,
    };
}

export const sendTaskNotifications = async (tasks: ExtractedTask[]): Promise<void> => {
    const { overdueTasks, stuckTasks } = await getDueDateTasks(tasks);
    // Send notifications for overdue tasks
    for (const task of overdueTasks) {
        if (task.assignees) {
            for (const assignee of task.assignees) {
                await sendEMail({
                    email: assignee.email,
                    subject: "Overdue Task Notification",
                    templateKey: "overdue-tasks",
                    placeholders: {
                        assigneeName: assignee.name,
                        taskName: task.task,
                        dueDate: task.dueDate || "No due date",
                        status: task.status,
                        workspaceUrl: process.env.NOTION_WORKSPACE_URL || '#'
                    }
                });
            }
        }
    }

    // Send notifications for stuck tasks
    for (const task of stuckTasks) {
        if (task.assignees) {
            for (const assignee of task.assignees) {
                await sendEMail({
                    email: assignee.email,
                    subject: "Stuck Task Alert",
                    templateKey: "stuck-tasks",
                    placeholders: {
                        assigneeName: assignee.name,
                        taskName: task.task,
                        stuckDays: task.stuckForDays?.toString() || "unknown",
                        status: task.status,
                        workspaceUrl: process.env.NOTION_WORKSPACE_URL || '#'
                    }
                });
            }
        }
    }
}