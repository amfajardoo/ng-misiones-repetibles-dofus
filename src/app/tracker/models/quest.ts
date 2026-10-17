import { Period } from './period';

export interface Quest {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly kamas: number;
  readonly annexe: string | null;
  readonly period: Period;
  readonly variable?: boolean;
}
