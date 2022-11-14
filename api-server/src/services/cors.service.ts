/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { Request, Response, NextFunction } from 'express';

class CorsService {
  corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (this.isOriginAllowed(req.get('Origin'))) {
      res.set('Access-Control-Allow-Origin', req.get('Origin'));
      res.set('Access-Control-Allow-Credentials', 'true');
    }
    if (this.isPreflight(req)) {
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
      res.status(204).end();
    } else {
      next();
    }
  };

  isPreflight(req: Request) {
    return req.method === 'OPTIONS' && req.get('Origin') && req.get('Access-Control-Request-Method');
  }

  isOriginAllowed(origin?: string) {
    return !!origin;
  }
}

export const corsService = new CorsService();
