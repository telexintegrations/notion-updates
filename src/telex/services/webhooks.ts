import { Request, Response } from "express";
import { appEmitter } from "../../global/events";
import { TELEX_EVENTS } from "../events";
import { sendTelexUpdate } from "./sendTelex";
import { errorHandler, successHandler } from "../../global/utils";
import { IWebhookResponse } from "../types";

appEmitter.on(TELEX_EVENTS.TELEX_WEBHOOK, async (payload: IWebhookResponse) => {
    try {
        await sendTelexUpdate(payload);
        console.log('Telex update sent successfully');

    } catch (error) {
        console.error('Failed to send telex update:', error);
    }
});


export const handleTelexWebhook = async (req: Request, res: Response) => {
    try {

        const webhookResponse: IWebhookResponse = req.body;

        console.log('data from telex:- ', webhookResponse ? 'true' : 'false');

        if (!webhookResponse.channel_id || !webhookResponse.return_url) {
            return errorHandler(res, 'channel_id and return_url are required', 404);
        }

        const payload = {
            channel_id: webhookResponse.channel_id,
            return_url: webhookResponse.return_url
        }

        appEmitter.emit(TELEX_EVENTS.TELEX_WEBHOOK, payload);

        return successHandler(res, "Webhook received", payload);
    } catch (error) {
        console.error('Error processing webhook:', error);
        return errorHandler(res, 'Internal server error', 500);
    }
}
