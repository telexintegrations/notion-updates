export interface IWebhookResponse {
    channel_id: string;
    return_url: string;
    settings: {
        default: string;
        label: string;
        required: boolean;
        type: string;
    }[]
}
