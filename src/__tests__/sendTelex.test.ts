import axios from 'axios';
import { sendTelexUpdate } from '../telex/services/sendTelex';
import { getDatabaseData } from '../notion/services/db';
import { formatOutputMessage } from '../notion/services/formatData';
import { sendTaskNotifications } from '../notion/services/sendNotification';
import { beforeEach, describe, expect, it, jest, beforeAll, afterAll } from '@jest/globals';


jest.mock('axios');
jest.mock('../notion/services/db');
jest.mock('../notion/services/formatData');
jest.mock('../notion/services/sendNotification');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetDatabaseData = getDatabaseData as jest.MockedFunction<typeof getDatabaseData>;
const mockedFormatOutputMessage = formatOutputMessage as jest.MockedFunction<typeof formatOutputMessage>;
const mockedSendTaskNotifications = sendTaskNotifications as jest.MockedFunction<typeof sendTaskNotifications>;

beforeAll(() => {
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    // Restore console.error after tests
    jest.restoreAllMocks();
});

describe('Send Telex Update', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock data with correct structure
        const mockTasks = [{
            id: '1',
            title: 'Test Task',
            created_time: '2023-01-01',
            last_edited_time: '2023-01-01',
            url: 'https://notion.so/test-task'
        }];

        mockedGetDatabaseData.mockResolvedValue(mockTasks);
        mockedFormatOutputMessage.mockResolvedValue('Formatted message');
        mockedSendTaskNotifications.mockResolvedValue(undefined);
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
    });

    it('should successfully send telex update', async () => {
        const webhookData = {
            channel_id: 'test-channel',
            return_url: 'https://test.telex.im/webhook'
        };

        const result = await sendTelexUpdate({
            ...webhookData,
            settings: [{
                default: 'default value',
                label: 'Test Setting',
                required: true, 
                type: 'string'
            }]
        });

        expect(mockedGetDatabaseData).toHaveBeenCalled();
        expect(mockedFormatOutputMessage).toHaveBeenCalled();
        expect(mockedSendTaskNotifications).toHaveBeenCalled();
        expect(mockedAxios.post).toHaveBeenCalledWith(
            webhookData.return_url,
            expect.objectContaining({
                event_name: 'task_updates',
                status: 'success',
                username: 'Notion Bot'
            }),
            expect.any(Object)
        );
        expect(result).toBe(true);
    });

    it('should handle errors when getting database data', async () => {
        const mockWebhookData = {
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com'
        };

        mockedGetDatabaseData.mockRejectedValue(new Error('Database error'));

        await expect(sendTelexUpdate({
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com',
            settings: [{
                default: 'default value',
                label: 'Test Setting', 
                required: true,
                type: 'string'
            }]
        })).rejects.toThrow('Database error');
        expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle errors when sending webhook', async () => {
        const mockTasks = [{ id: '1', title: 'Test Task' }];
        const mockFormattedTasks = 'Formatted task message';
        const mockWebhookData = {
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com'
        };

        mockedGetDatabaseData.mockResolvedValue([{
            id: '1',
            title: 'Test Task',
            url: 'https://notion.so/test',
            last_edited_time: '2023-01-01',
            created_time: '2023-01-01'
        }]);
        mockedFormatOutputMessage.mockResolvedValue(mockFormattedTasks);
        mockedSendTaskNotifications.mockResolvedValue();
        mockedAxios.post.mockRejectedValue(new Error('Network error'));

        await expect(sendTelexUpdate({
            channel_id: 'test-channel',
            return_url: 'https://test-return-url.com',
            settings: [{
                default: 'default value',
                label: 'Test Setting',
                required: true, 
                type: 'string'
            }]
        })).rejects.toThrow('Network error');
    });
});