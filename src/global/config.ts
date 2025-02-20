export const validateConfig = () => {
    // All required environment variables
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

    // Check if all required variables exist
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            throw new Error(`${varName} is required`);
        }
    }

    // Validate URL formats
    const urlVars = [
        'NOTION_BASE_URL',
        'TELEX_TARGET_URL',
        'TELEX_TICK_URL',
        'NOTION_WORKSPACE_URL',
        'HOST_URL'
    ];

    for (const urlVar of urlVars) {
        try {
            new URL(process.env[urlVar]!);
        } catch {
            throw new Error(`Invalid URL format for ${urlVar}`);
        }
    }

    // Validate PORT is a number
    if (isNaN(Number(process.env.PORT))) {
        throw new Error('PORT must be a number');
    }

    // Validate email format for BREVO_USER
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.BREVO_USER)) {
        throw new Error('BREVO_USER must be a valid email address');
    }

    return true;
};