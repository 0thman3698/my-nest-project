import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log({
      Headers: req.headers,
      Method: req.method,
      hostname: req.hostname,
    });
    next();
  }
}
