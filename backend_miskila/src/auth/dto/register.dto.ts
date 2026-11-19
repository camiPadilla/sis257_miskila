import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsByteLength,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '73463222', description: 'Celular boliviano de 8 dígitos' })
  @IsString()
  @Matches(/^[67]\d{7}$/, {
    message: 'El celular debe tener 8 dígitos y comenzar con 6 o 7',
  })
  celular!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @IsByteLength(8, 72)
  contrasena!: string;

  @ApiProperty({ example: true, description: 'Aceptación de los términos' })
  @IsBoolean()
  @Equals(true, { message: 'Debes aceptar los términos para registrarte' })
  aceptaTerminos!: boolean;
}
