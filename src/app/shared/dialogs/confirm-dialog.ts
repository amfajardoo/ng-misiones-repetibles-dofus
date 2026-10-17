import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>¿Desmarcar todas las misiones?</h2>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Desmarcar</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {}
