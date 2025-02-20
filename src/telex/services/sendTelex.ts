import axios from "axios";
import { appEmitter } from "../../global/events";
import { getDatabaseData } from "../../notion/services/db";
import { formatOutputMessage } from "../../notion/services/formatData";
import { TELEX_EVENTS } from "../events";
import { IWebhookResponse } from "../types";
import { sendTaskNotifications } from "../../notion/services/sendNotification";

const TELEX_URL = process.env.TELEX_TARGET_URL;

export const sendTelexUpdate = async (data: IWebhookResponse) => {
    try {
const tasks = await getDatabaseData();

const formattedTasks = await formatOutputMessage(tasks);

const notifications = await sendTaskNotifications(tasks);

const payload = {
    event_name: "task_updates",
    message: formattedTasks,
    status: "success",
    username: "Notion Bot",
}

const response = await axios.post(`${data.return_url}`, payload, {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

console.log("response:- ",  response.data);

return true;

    } catch (error) {
        console.error('Error sending telex update:', error);
        throw error;
    }
}