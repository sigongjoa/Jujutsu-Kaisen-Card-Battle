import { AuthService } from '../services/AuthService';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService('test-secret');
    });

    test('should register a new user', async () => {
        const result = await authService.register('test@example.com', 'password123', 'testuser');
        expect(result.user.username).toBe('testuser');
        expect(result.token).toBeDefined();
    });

    test('should login an existing user', async () => {
        await authService.register('test@example.com', 'password123', 'testuser');
        const result = await authService.login('test@example.com', 'password123');
        expect(result.user.username).toBe('testuser');
        expect(result.token).toBeDefined();
    });

    test('should fail login with wrong password', async () => {
        await authService.register('test@example.com', 'password123', 'testuser');
        await expect(authService.login('test@example.com', 'wrongpassword'))
            .rejects.toThrow('Invalid credentials');
    });

    test('should fail registration with existing email', async () => {
        await authService.register('test@example.com', 'password123', 'testuser');
        await expect(authService.register('test@example.com', 'password456', 'otheruser'))
            .rejects.toThrow('Email already registered');
    });
});
