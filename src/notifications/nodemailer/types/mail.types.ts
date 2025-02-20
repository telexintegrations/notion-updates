export interface IEmailPayload {
    [key: string]: string;
  }
  
  export interface IMailData {
    templateKey: any;
    placeholders: IEmailPayload;
    subject: string;
    email: string;
  }