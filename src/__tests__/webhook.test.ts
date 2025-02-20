import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { TELEX_EVENTS } from '../telex/events';

// Mock the event emitter BEFORE importing the file that uses it
jest.mock('../global/events', () => ({
    appEmitter: {
        emit: jest.fn(),
        on: jest.fn()
    }
}));

// Now import the file that uses the mock
import { handleTelexWebhook } from '../telex/services/webhooks';
import { appEmitter } from '../global/events';

describe('Telex Webhook Handler', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const mockJson = jest.fn();
    const mockStatus = jest.fn();

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: mockStatus.mockReturnThis(),
            json: mockJson,
            send: jest.fn()
        } as unknown as Response;
        jest.clearAllMocks();
    });

    it('should handle valid webhook data', async () => {
        mockRequest.body = {
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com'
        };

        await handleTelexWebhook(mockRequest as Request, mockResponse as Response);

        expect(appEmitter.emit).toHaveBeenCalledWith(TELEX_EVENTS.TELEX_WEBHOOK, {
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com'
        });
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: 'Webhook received',
            data: {
                channel_id: 'test-channel',
                return_url: 'https://test-return-url.com'
            }
        });
    });

    it('should return error for missing channel_id', async () => {
        mockRequest.body = {
            return_url: 'https://test-return-url.com'
        };

        await handleTelexWebhook(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'channel_id and return_url are required'
        });
    });

    it('should return error for missing return_url', async () => {
        mockRequest.body = {
            channel_id: 'test-channel'
        };

        await handleTelexWebhook(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'channel_id and return_url are required'
        });
    });

    it('should handle internal server errors', async () => {
        mockRequest.body = null;

        await handleTelexWebhook(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'Internal server error'
        });
    });
});