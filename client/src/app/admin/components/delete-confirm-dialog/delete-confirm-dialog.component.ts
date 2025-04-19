import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface DeleteConfirmDialogData {
  title: string;
  message: string;
  itemName?: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  templateUrl: './delete-confirm-dialog.component.html',
  styleUrls: ['./delete-confirm-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class DeleteConfirmDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmDialogData
  ) { }
  
  onCancelClick(): void {
    this.dialogRef.close(false);
  }
  
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}