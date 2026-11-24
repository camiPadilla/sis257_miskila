import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsByteLength, IsString, Matches } from 'class-validator';
import { AuthPublic } from './decorators/auth-public.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';

class CuentaDto { @IsString() @Matches(/^[67]\d{7}$/) celular!: string; @IsString() @IsByteLength(8, 72) contrasena!: string; }
class NombreDto { @IsString() nombreCompleto!: string; }
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') @AuthPublic() register(@Body() body: CuentaDto) { return this.auth.register(body.celular, body.contrasena); }
  @Post('login') @AuthPublic() login(@Body() body: CuentaDto) { return this.auth.login(body.celular, body.contrasena); }
  @Get('me') @UseGuards(JwtAuthGuard) me(@Req() request: { user: { sub: number } }) { return this.auth.me(request.user.sub); }
  @Patch('nombre') @UseGuards(JwtAuthGuard) completeName(@Req() request: { user: { sub: number } }, @Body() body: NombreDto) { return this.auth.completeName(request.user.sub, body.nombreCompleto); }
}
