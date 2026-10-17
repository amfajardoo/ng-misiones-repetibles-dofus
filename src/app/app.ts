import { Component, inject } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { RouterOutlet } from '@angular/router';
import { QuestStatsService } from './tracker/services/quest-stats.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly stats = inject(QuestStatsService);
}
