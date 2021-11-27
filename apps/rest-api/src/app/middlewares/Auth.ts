import { NextFunction, Request, Response as ExpressResponse } from 'express';
import { Response } from '@marketplace/shared';
import { AdministratorService, AuthRole, AuthService, UserService } from '@marketplace/services';

export const authMiddleware = (
  role: AuthRole | AuthRole[],
  response: Response,
  includeData = false,
) => async (
  req: Request,
  res: ExpressResponse,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return response.error(res, 'Unauthorized', 401);
    }
    const token = authorization.split(' ')[1];
    const authService = await AuthService.getInstance();
    const payload = authService.verifyToken(token) as any;
    if (!payload) {
      return response.error(res, 'Unauthorized', 401);
    }
    if (role === 'administrator' && payload.role === 'administrator') {
      if (includeData) {
        const administratorService = await AdministratorService.getInstance();
        req.body.administrator = await administratorService.getOne(payload.id);
      }
      return next();
    }

    if (role === 'user' && payload.role === 'user') {
      if (includeData) {
        const userService = await UserService.getInstance();
        req.body.user = await userService.getOne(payload.id);
      }
      return next();
    }

    if (Array.isArray(role)) {
      const isAuthorized = role.includes(payload.role);
      if (!isAuthorized) {
        return response.error(res, 'Unauthorized', 401);
      }
      await Promise.all(role.map(async (r) => {
        if (r === payload.role) {
          if (r === 'administrator' && includeData) {
            const administratorService = await AdministratorService.getInstance();
            req.body.administrator = await administratorService.getOne(payload.id);
          }
          if (r === 'user' && includeData) {
            const userService = await UserService.getInstance();
            const user = await userService.getOne(payload.id);
            req.body.user = user;
          }
        }
      }));
      return next();
    }
    return response.error(res, 'Unauthorized', 401);
  } catch (e) {
    console.error(e);
    response.error(res, 'Unauthorized', 401);
    return null;
  }
};
