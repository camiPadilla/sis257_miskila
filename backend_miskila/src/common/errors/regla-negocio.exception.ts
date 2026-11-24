import { HttpException, HttpStatus } from '@nestjs/common';

export class ReglaNegocioException extends HttpException {
  constructor(codigo: string, message: string) {
    super({ statusCode: HttpStatus.UNPROCESSABLE_ENTITY, codigo, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
