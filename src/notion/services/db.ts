import axios from "axios";
import { DateProperty, ExtractedTask, NotionResponse, PeopleProperty, SelectProperty, StatusProperty, TitleProperty } from "../types";

const baseUrl = process.env.NOTION_BASE_URL
const databaseId = process.env.NOTION_DATABASE_ID

export const getDatabaseData = async (): Promise<ExtractedTask[]> => {
    const response = await axios.post<NotionResponse>(`${baseUrl}/databases/${databaseId}/query`, {}, {
        headers: {
            'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        }
    })
    return response.data.results.map((task) => {
        let extractedData = {
            created_time: task.created_time,
            last_edited_time: task.last_edited_time
        }
       for (const [key, value] of Object.entries(task.properties)) {
        switch (value.type) {
            case 'title':
                extractedData = {
                    ...extractedData,
                    [key]: (value as TitleProperty).title[0]?.plain_text || "No title"
                };
                break;
                case "status":
                    extractedData = {
                        ...extractedData,
                        [key]: (value as StatusProperty).status?.name || "No status"
                    };
                    break;
                case "date":
                    extractedData = {
                        ...extractedData,
                        [key]: (value as DateProperty).date?.start || "No date"
                    };
                    break;
                  case "people":
                    extractedData = {
                        ...extractedData,
                        [key]: (value as PeopleProperty).people.length > 0
                        ? (value as PeopleProperty).people.map((p) => ({
                            email: p.person.email,
                            name: p.name,
                          }))
                            : "Unassigned"
                    };
                    break;
                  case "select":
                    extractedData = {
                        ...extractedData,
                        [key]: (value as SelectProperty).select?.name || "Not set"
                    };
                    break;
                  default:
                    extractedData = {
                        ...extractedData,
                        [key]: "Unsupported property type"
                    };
        }
    }
    // console.log('extractedData:- ', extractedData)
    return extractedData as ExtractedTask
    })
}
