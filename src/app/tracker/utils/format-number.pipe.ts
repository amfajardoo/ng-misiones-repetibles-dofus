import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatNumber', pure: true })
export class FormatNumberPipe implements PipeTransform {
  transform(value: number): string {
    return Math.round(value).toLocaleString('es-ES');
  }
}
