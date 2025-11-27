import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayloadType } from '../../utils/types';
import { CURRENT_USER_KEY } from '../../utils/constants';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    const payload = request[CURRENT_USER_KEY] as JWTPayloadType;
    return payload;
  },
);
