import { readFileSync } from "fs";
import path from "path";

export const readEmailTemplate = (templateName: string): string => {
    const emailTemplatePath = path.join(
      __dirname,
      "../../",
      "templates/emails",
      `${templateName}.html`
    );
    return readFileSync(emailTemplatePath, "utf-8");
  };