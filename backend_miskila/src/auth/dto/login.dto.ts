import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '73463222' })
  @IsString()
  @Matches(/^[67]\d{7}$/)
  celular!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @IsByteLength(8, 72)
  contrasena!: string;
}
