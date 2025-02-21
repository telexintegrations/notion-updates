import { Request, Response } from 'express';

const hostUrl = process.env.HOST_URL;
const targetUrl = process.env.TELEX_TARGET_URL;

export const integrationJSON = (req: Request, res: Response) => {
  const jsonData = {
    "data": {
      "date": {
        "created_at": "2025-02-19",
        "updated_at": "2025-02-19"
      },
      "descriptions": {
        "app_name": "Notion Updates",
        "app_description": "Checks the Notion board at regular intervals to gather updates on task statuses,  send a summary of completed tasks, tasks that are overdue, and upcoming deadlines.  If a task has been stuck in a specific column (e.g., \"In Progress\") for too long, the bot can notify the assigned team member via telex ad also send an email",
        "app_logo": "https://res.cloudinary.com/dwvwvluhs/image/upload/v1739926444/telexandnotion_zpvl9g.png",
        "app_url": `${hostUrl}`,
        "background_color": "#fff"
      },
      "is_active": true,
      "integration_category": "Project Management",
      "integration_type": "interval",
      "key_features": [
        "Daily updates",
        "Email notifications"
      ],
      "author": "Kachie Osuji",
      "settings": [
        {
          "label": "interval",
          "type": "text",
          "required": true,
          "default": "0 9 * * *"
        },
        {
          "label": "Do you want to continue",
          "type": "checkbox",
          "required": true,
          "default": "true"
        },
        {
          "label": "Send Email",
          "type": "checkbox",
          "required": true,
          "default": "false"
        },
        {
          "label": "message",
          "type": "text",
          "required": true,
          "default": "Basic"
        },
        {
          "label": "include logs",
          "type": "checkbox",
          "required": true,
          "default": "true"
        }
      ],
      "target_url": targetUrl,
      "tick_url": `${hostUrl}notion-updates`
      // "tick_url": `${hostUrl}telex/integration`
    }
  }

  res.status(200).json(jsonData);
}