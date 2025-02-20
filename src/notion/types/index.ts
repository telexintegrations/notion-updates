// Interface for the Notion API response
export interface NotionResponse {
    object: string;
    results: NotionPage[];
  }
  
  // Interface for a single Notion page (task)
  export interface NotionPage {
    object: string;
    id: string;
    created_time: string;
    last_edited_time: string;
    properties: Record<string, NotionProperty>;
    url: string;
  }
  
  // Types for different property types in Notion
  export type NotionProperty =
    | TitleProperty
    | StatusProperty
    | DateProperty
    | PeopleProperty
    | SelectProperty
    | UnknownProperty;
  
  // Interface for Title Property
  export interface TitleProperty {
    type: "title";
    title: { plain_text: string }[];
  }
  
  // Interface for Status Property
  export interface StatusProperty {
    type: "status";
    status?: { name: string };
  }
  
  // Interface for Date Property
  export interface DateProperty {
    type: "date";
    date?: { start: string };
  }
  
  // Interface for People Property
  export interface PeopleProperty {
    type: "people";
    people: {
      person: { email: string };
      name: string;
    }[];
  }
  
  // Interface for Select Property
  export interface SelectProperty {
    type: "select";
    select?: { name: string };
  }
  
  // Fallback for unknown property types
  export interface UnknownProperty {
    type: string;
  }
  
  // Extracted task structure
  export interface ExtractedTask {
    [key: string]: string;
    url: string;
    last_edited_time: string;
    created_time: string;

  }
  
  export interface TaskNotification {
    task: string;
    assignees?: { name: string; email: string; }[];
    dueDate?: string;
    status: string;
    stuckForDays?: number;
}