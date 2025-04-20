import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Room } from '../../../models/room.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-room-form-dialog',
  templateUrl: './room-form-dialog.component.html',
  styleUrls: ['./room-form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatChipsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule
  ]
})
export class RoomFormDialogComponent implements OnInit {
  roomForm!: FormGroup;
  isEdit: boolean;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  amenities: string[] = [];
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RoomFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', room: Room | null }
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const room = this.data.room;
    
    if (this.isEdit && room) {
      this.amenities = [...room.amenities];
    }
    
    // Use the first image from the images array as the imageUrl if available
    const initialImageUrl = room?.images?.length ? room.images[0] : '';
    
    this.roomForm = this.fb.group({
      name: [room?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [room?.description || '', [Validators.required, Validators.minLength(10)]],
      price: [room?.price || 0, [Validators.required, Validators.min(0)]],
      capacity: [room?.capacity || 1, [Validators.required, Validators.min(1)]],
      size: [room?.size || 0, [Validators.required, Validators.min(1)]],
      imageUrl: [room?.imageUrl || initialImageUrl, [Validators.required, Validators.pattern('https?://.+')]]
    });
  }
  
  // Sửa kiểu dữ liệu để tương thích với MatChipInputEvent
  addAmenity(event: any): void {
    const value = (event.value || '').trim();
    
    if (value) {
      this.amenities.push(value);
    }
    
    if (event.chipInput) {
      event.chipInput.clear();
    }
  }
  
  removeAmenity(amenity: string): void {
    const index = this.amenities.indexOf(amenity);
    
    if (index >= 0) {
      this.amenities.splice(index, 1);
    }
  }
  
  onSubmit(): void {
    if (this.roomForm.invalid) {
      return;
    }
    
    const formValue = this.roomForm.value;
    
    // Convert imageUrl to images array
    const images = [formValue.imageUrl];
    
    const room: Partial<Room> = {
      ...formValue,
      images: images,
      amenities: this.amenities,
      available: this.data.room?.available !== undefined ? this.data.room.available : true
    };
    
    if (this.isEdit && this.data.room) {
      room.id = this.data.room.id;
    }
    
    this.dialogRef.close(room);
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}