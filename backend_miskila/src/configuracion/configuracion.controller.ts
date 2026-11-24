import { Controller, Get } from '@nestjs/common';
import { AuthPublic } from '../auth/decorators/auth-public.decorator.js';
import { NEGOCIO_CONFIG } from '../common/config/negocio.config.js';

@Controller('configuracion')
export class ConfiguracionController {
  @Get('publica')
  @AuthPublic()
  public() {
    const now = new Date();
    return { ...NEGOCIO_CONFIG, compraAbiertaAhora: this.isPurchaseOpen(now), ahoraServidor: now.toISOString() };
  }

  private isPurchaseOpen(date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: NEGOCIO_CONFIG.zonaHoraria, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date);
    const weekday = parts.find((part) => part.type === 'weekday')?.value;
    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday ?? '') && (hour < 18 || (hour === 18 && minute === 0));
  }
}
