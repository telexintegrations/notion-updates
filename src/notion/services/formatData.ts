import { ExtractedTask } from "../types";

// export const formatTaskUpdates = async (tasks: ExtractedTask[]): Promise<Record<string, any>> => {
//     const today = new Date();

//     const overdueTasks = tasks
//       .filter(
//         (task) => task.dueDate !== "No due date" && new Date(task.dueDate) < today
//       )
//       .map((task) => ({
//         task: task.name,
//         assignees: task.assignees,
//         dueDate: task.dueDate,
//         status: "Overdue",
//       }));

//     const completedTasks = tasks
//       .filter((task) => task.status === "Done")
//       .map((task) => task.name);

//     const upcomingTasks = tasks
//       .filter(
//         (task) => task.dueDate !== "No due date" && new Date(task.dueDate) > today
//       )
//       .map((task) => ({
//         task: task.name,
//         dueInDays: Math.ceil(
//           (new Date(task.dueDate).getTime() - today.getTime()) /
//             (1000 * 60 * 60 * 24)
//         ),
//       }));

//     const stuckTasks = tasks
//       .filter((task) => task.status === "In Progress")
//       .map((task) => ({
//         task: task.name,
//         status: task.status,
//         stuckForDays: Math.ceil(
//           (today.getTime() - new Date(task.dueDate).getTime()) /
//             (1000 * 60 * 60 * 24)
//         ),
//       }));

//     return {
//       overdueTasks,
//       completedTasks,
//       upcomingTasks,
//       stuckTasks,
//     };
//   }



export const formatOutputMessage = async (tasks: ExtractedTask[]) => {
    let message = "**📌 Notion Task Updates**\n\n";
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const completedTasks = tasks.filter((task) =>
        task.Status === "Done" &&
        new Date(task.completedAt) > yesterday
    );
    const upcomingTasks = tasks.filter((task) => task.Status === "Not started");
    const overdueTasks = tasks.filter(
        (task) =>
            task["Due date"] !== "No date" &&
            new Date(task["Due date"]) < now &&
            task.Status !== "Done"
    );
    const inProgressTasks = tasks.filter((task) => task.Status === "In progress");

    // Overdue Tasks Section
    message += "**🚨 OVERDUE TASKS**\n";
    if (overdueTasks.length > 0) {
        overdueTasks.forEach((task) => {
            message += `• Task "${task.Task}" assigned to ${Array.isArray(task.Assignee) ? task.Assignee.map(a => a.name).join(", ") : task.Assignee
                } (Due: ${task["Due date"]})\n`;
            message += ` • Email notification sent to ${Array.isArray(task.Assignee) ? task.Assignee.map(a => a.email).join(", ") : task.Assignee
                }\n`;
        });
    } else {
        message += "No overdue tasks! 🎉\n";
    }
    message += "\n";

    // Completed Tasks Section
    message += "**✅ COMPLETED TASKS (LAST 24H)**\n";
    if (completedTasks.length > 0) {
        completedTasks.forEach((task) => {
            message += `• ${task.Task}\n`;
        });
    } else {
        message += "No tasks completed in the last 24 hours.\n";
    }
    message += "\n";

    // Upcoming Tasks Section
    message += "**📅 UPCOMING TASKS**\n";
    if (upcomingTasks.length > 0) {
        upcomingTasks.forEach((task) => {
            const dueText = task["Due date"] !== "No date"
                ? `Due in ${Math.ceil(
                    (new Date(task["Due date"]).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                )} days`
                : "Due date not set";

            const assigneeText = Array.isArray(task.Assignee)
                ? task.Assignee.map(a => a.name).join(", ")
                : task.Assignee || "Unassigned";

            message += `• ${task.Task} (${dueText}) - Assigned to: ${assigneeText}\n`;
        });
    } else {
        message += "No upcoming tasks scheduled.\n";
    }
    message += "\n";

    // In Progress Tasks Section
    message += "**⏳ IN PROGRESS TASKS**\n";
    if (inProgressTasks.length > 0) {
        inProgressTasks.forEach((task) => {
            let dueText = "Due date not set";
            if (task["Due date"] !== "No date") {
                const dueDate = new Date(task["Due date"]);
                if (dueDate < now) {
                    dueText = "OVERDUE";
                } else {
                    const daysLeft = Math.ceil(
                        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    dueText = `Due in ${daysLeft} days`;
                }
            }

            const assigneeText = Array.isArray(task.Assignee)
                ? task.Assignee.map(a => a.name).join(", ")
                : task.Assignee || "Unassigned";

            message += `• ${task.Task} (${dueText}) - Assigned to: ${assigneeText}\n`;
        });
    } else {
        message += "No tasks currently in progress.\n";
    }
    message += "\n";

    return message.trim();
}
