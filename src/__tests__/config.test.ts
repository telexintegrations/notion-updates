import { validateConfig } from '../global/config';
import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';


describe('Environment Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv };
        // Set valid default values for all required variables
        process.env.NOTION_DATABASE_ID = 'test-database-id';
        process.env.NOTION_API_KEY = 'test-api-key';
        process.env.NOTION_BASE_URL = 'https://api.notion.com/v1';
        process.env.TELEX_TARGET_URL = 'https://test.telex.im/webhook';
        process.env.TELEX_TICK_URL = 'https://test.example.com/tick';
        process.env.NOTION_WORKSPACE_URL = 'https://www.notion.so/workspace';
        process.env.PORT = '3000';
        process.env.BREVO_USER = 'test@example.com';
        process.env.BREVO_PASS = 'test-password';
        process.env.HOST_URL = 'http://localhost:3000';
    });

    afterAll(() => {
        // Restore original environment after all tests
        process.env = originalEnv;
    });

    it('should validate when all required variables are present with valid values', () => {
        expect(validateConfig()).toBe(true);
    });

    // Test missing variables
    const requiredVars = [
        'NOTION_DATABASE_ID',
        'NOTION_API_KEY',
        'NOTION_BASE_URL',
        'TELEX_TARGET_URL',
        'TELEX_TICK_URL',
        'NOTION_WORKSPACE_URL',
        'PORT',
        'BREVO_USER',
        'BREVO_PASS',
        'HOST_URL'
    ];

    requiredVars.forEach(varName => {
        it(`should throw error when ${varName} is missing`, () => {
            delete process.env[varName];
            expect(() => validateConfig()).toThrow(`${varName} is required`);
        });
    });

    // Test URL validations
    const urlVars = [
        'NOTION_BASE_URL',
        'TELEX_TARGET_URL',
        'TELEX_TICK_URL',
        'NOTION_WORKSPACE_URL',
        'HOST_URL'
    ];

    urlVars.forEach(urlVar => {
        it(`should throw error when ${urlVar} is invalid`, () => {
            process.env[urlVar] = 'not-a-valid-url';
            expect(() => validateConfig()).toThrow(`Invalid URL format for ${urlVar}`);
        });
    });

    it('should throw error when PORT is not a number', () => {
        process.env.PORT = 'not-a-number';
        expect(() => validateConfig()).toThrow('PORT must be a number');
    });

    it('should throw error when BREVO_USER is not a valid email', () => {
        process.env.BREVO_USER = 'not-an-email';
        expect(() => validateConfig()).toThrow('BREVO_USER must be a valid email address');
    });

    // Test valid variations
    it('should accept different port numbers', () => {
        process.env.PORT = '8080';
        expect(validateConfig()).toBe(true);
    });

    it('should accept different valid email formats', () => {
        const validEmails = [
            'test.user@example.com',
            'test+label@example.co.uk',
            'test_user@sub.example.com'
        ];

        validEmails.forEach(email => {
            process.env.BREVO_USER = email;
            expect(validateConfig()).toBe(true);
        });
    });

    it('should accept different valid URL formats', () => {
        const validUrls = {
            NOTION_BASE_URL: 'https://api.notion.com/v2',
            TELEX_TARGET_URL: 'https://webhook.telex.im/custom',
            TELEX_TICK_URL: 'http://localhost:3000/tick',
            NOTION_WORKSPACE_URL: 'https://notion.so/workspace-123',
            HOST_URL: 'https://myapp.example.com'
        };

        Object.entries(validUrls).forEach(([key, url]) => {
            process.env[key] = url;
            expect(validateConfig()).toBe(true);
        });
    });
});