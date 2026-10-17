import { Quest } from './quest';

export interface Zone {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly variant?: boolean;
  readonly variantNote?: string;
  readonly quests: readonly Quest[];
}
