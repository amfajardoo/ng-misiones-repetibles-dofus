import { InjectionToken } from '@angular/core';
import { Zone } from '../models/zone';
import { ZONES } from './zones';

export const ZONE_CATALOGUE = new InjectionToken<readonly Zone[]>('zone catalogue', {
  providedIn: 'root',
  factory: () => ZONES,
});
