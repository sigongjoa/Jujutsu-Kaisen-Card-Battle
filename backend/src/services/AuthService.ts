/**
 * Authentication Service - Handles user registration and login
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private jwtSecret: string;

  constructor(jwtSecret: string = 'your-secret-key') {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, username: string): Promise<{ user: UserProfile; token: string }> {
    // Check if email already exists
    if (this.emailIndex.has(email)) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user: User = {
      userId,
      username,
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(userId, user);
    this.emailIndex.set(email, userId);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.userToProfile(user),
      token
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    // Find user by email
    const userId = this.emailIndex.get(email);
    if (!userId) {
      throw new Error('Invalid credentials');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.userToProfile(user),
      token
    };
  }

  /**
   * Verify token and get user
   */
  verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return this.users.get(decoded.userId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: string): UserProfile | null {
    const user = this.users.get(userId);
    if (!user) return null;
    return this.userToProfile(user);
  }

  /**
   * Convert user to profile (without sensitive data)
   */
  private userToProfile(user: User): UserProfile {
    return {
      userId: user.userId,
      username: user.username,
      displayName: user.username,
      bio: '',
      avatar: '',
      totalGames: 0,
      totalWins: 0,
      eloRating: 1200,
      joinedAt: user.createdAt
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    return jwt.sign({ userId: user.userId }, this.jwtSecret, {
      expiresIn: '7d'
    });
  }
}

export const authService = new AuthService(process.env.JWT_SECRET || 'your-secret-key');
