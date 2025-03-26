# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Mastra Agent Generator, please report it by sending an email to security@example.com. Please do not disclose security vulnerabilities publicly until they have been handled by the security team.

## Supported Versions

Only the latest version of the Mastra Agent Generator is currently being supported with security updates.

## Security Measures

The Mastra Agent Generator implements the following security measures:

1. **API Key Protection**: All API keys are stored as environment variables and never exposed in the code.
2. **Input Validation**: All user inputs are validated before processing.
3. **Rate Limiting**: API endpoints are protected with rate limiting to prevent abuse.
4. **CORS Protection**: Cross-Origin Resource Sharing (CORS) is configured to restrict access to the API.
5. **Security Headers**: HTTP security headers are set using Helmet.js to protect against common web vulnerabilities.
6. **Dependency Scanning**: Regular scanning of dependencies for known vulnerabilities.

## Best Practices for Users

1. **API Keys**: Never share your API keys or include them in client-side code.
2. **Environment Variables**: Store sensitive information in environment variables, not in your code.
3. **Regular Updates**: Keep the application and its dependencies up to date.
4. **Access Control**: Implement proper access control in your deployment environment.
