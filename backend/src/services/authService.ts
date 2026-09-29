import jwt from 'jsonwebtoken';
import { UserRepository, UserRecord } from '../repositories/userRepository.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
import { env } from '../config/env.js';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    company_name?: string;
    role?: string;
  };
}

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    full_name: string;
    company_name?: string;
  }): Promise<AuthResponse> {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const password_hash = await cryptoUtils.hashPassword(data.password);

    const newUser = await UserRepository.create({
      email: data.email,
      password_hash,
      full_name: data.full_name,
      company_name: data.company_name || '',
      role: 'user',
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        company_name: newUser.company_name,
        role: newUser.role,
      },
    };
  }

  static async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await cryptoUtils.comparePassword(data.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: user.role,
      },
    };
  }

  static verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      return jwt.verify(token, env.JWT_SECRET) as any;
    } catch (err) {
      throw new Error('Invalid or expired authentication token.');
    }
  }
}
