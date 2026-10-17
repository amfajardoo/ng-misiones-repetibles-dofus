import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'questCompleted', pure: true })
export class QuestCompletedPipe implements PipeTransform {
  transform(questId: string, completedByQuestId: Record<string, boolean>): boolean {
    return completedByQuestId[questId] === true;
  }
}
