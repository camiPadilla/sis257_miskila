import { SetMetadata } from '@nestjs/common';
export const AUTH_PUBLIC = 'authPublic';
export const AuthPublic = () => SetMetadata(AUTH_PUBLIC, true);
