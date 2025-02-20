import { afterAll, afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getDatabaseData } from '../notion/services/db';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Notion Database Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            NOTION_BASE_URL: 'https://api.notion.com/v1',
            NOTION_DATABASE_ID: 'test-db-id',
            NOTION_API_KEY: 'test-api-key'
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should extract task data correctly', async () => {
        const mockResponse = {
            data: {
                results: [{
                    created_time: '2024-01-01T00:00:00.000Z',
                    last_edited_time: '2024-01-02T00:00:00.000Z',
                    properties: {
                        Title: {
                            type: 'title',
                            title: [{ plain_text: 'Test Task' }]
                        },
                        Status: {
                            type: 'status',
                            status: { name: 'In Progress' }
                        },
                        DueDate: {
                            type: 'date',
                            date: { start: '2024-01-15' }
                        },
                        Assignee: {
                            type: 'people',
                            people: [{
                                person: { email: 'test@example.com' },
                                name: 'Test User'
                            }]
                        },
                        Priority: {
                            type: 'select',
                            select: { name: 'High' }
                        }
                    }
                }]
            }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await getDatabaseData();

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.notion.com/v1/databases/test-db-id/query',
            {},
            {
                headers: {
                    'Authorization': 'Bearer test-api-key',
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                }
            }
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-02T00:00:00.000Z',
            Title: 'Test Task',
            Status: 'In Progress',
            DueDate: '2024-01-15',
            Assignee: [{
                email: 'test@example.com',
                name: 'Test User'
            }],
            Priority: 'High'
        });
    });

    it('should handle missing or empty values', async () => {
        const mockResponse = {
            data: {
                results: [{
                    created_time: '2024-01-01T00:00:00.000Z',
                    last_edited_time: '2024-01-02T00:00:00.000Z',
                    properties: {
                        Title: {
                            type: 'title',
                            title: [] as {text: {content: string}}[]
                        },
                        Status: {
                            type: 'status',
                            status: null as {name: string} | null
                        },
                        DueDate: {
                            type: 'date',
                            date: null as {start: string} | null
                        },
                        Assignee: {
                            type: 'people',
                            people: [] as {person: {email: string}}[]
                        },
                        Priority: {
                            type: 'select',
                            select: null as {name: string} | null
                        }
                    }
                }]
            }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await getDatabaseData();

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            created_time: '2024-01-01T00:00:00.000Z',
            last_edited_time: '2024-01-02T00:00:00.000Z',
            Title: 'No title',
            Status: 'No status',
            DueDate: 'No date',
            Assignee: 'Unassigned',
            Priority: 'Not set'
        });
    });

    it('should handle API errors', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

        await expect(getDatabaseData()).rejects.toThrow('API Error');
    });

    it('should construct the correct URL', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { results: [] } });
        
        await getDatabaseData();
        
        const [url, data, config] = mockedAxios.post.mock.calls[0];
        console.log('URL:', url);
        console.log('Headers:', config?.headers);
        
        expect(url).toBe('https://api.notion.com/v1/databases/test-db-id/query');
    });
});