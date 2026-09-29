import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AuthService } from '../services/authService.js';
import { UserRepository } from '../repositories/userRepository.js';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password, full_name, company_name } = req.body;
      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password, and full name are required.' });
      }

      const result = await AuthService.register({ email, password, full_name, company_name });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await AuthService.login({ email, password });
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }
      const user = await UserRepository.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: user.role,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
