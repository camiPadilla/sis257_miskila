import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';

export class DetallePedidoDto {
  @IsInt() @Min(1) idPresentacion!: number;
  @IsInt() @Min(1) cantidad!: number;
  @IsOptional() @IsString() descripcionPersonalizada?: string;
}

export class CreatePedidoDto {
  @IsIn(['domicilio', 'retiro']) modalidad!: 'domicilio' | 'retiro';
  @IsOptional() @IsString() direccionEntrega?: string;
  @IsDateString() fechaEntrega!: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) horaEntrega!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => DetallePedidoDto) detalles!: DetallePedidoDto[];
}

export class CreatePedidoPersonalizadoDto extends CreatePedidoDto {
  @IsOptional() @IsInt() @Min(1) idCliente?: number;
  @IsOptional() @IsString() celularCliente?: string;
  @IsInt() @Min(1) idPresentacion!: number;
  @IsString() descripcionPersonalizada!: string;
  @IsString() precio!: string;
}
