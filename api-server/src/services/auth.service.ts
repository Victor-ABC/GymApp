/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'mysecret' + new Date().getTime();

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = jwt.verify(token, SECRET);
        next();
      } catch {
        res.status(401).json({ message: 'Bitte melden Sie sich an!' });
      }
    }
  };

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    res.cookie('jwt-token', token, { sameSite: 'lax' });
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}

export const authService = new AuthService();
