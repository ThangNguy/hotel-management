import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Room } from '../../../../models/room.model';

import { finalize } from 'rxjs';
import { ImageService } from '../../../../core/services/image.service';

interface RoomFormData {
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  beds: string;
  imageUrl: string;
}

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
    MatNativeDateModule,
    MatProgressBarModule
  ]
})
export class RoomFormDialogComponent implements OnInit {
  roomForm!: FormGroup;
  isEdit: boolean;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  amenities: string[] = [];
  
  // Upload related properties
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isUploading = false;
  uploadProgress = 0;
  previewUrl: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RoomFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', room: Room | null },
    private imageService: ImageService
  ) {
    this.isEdit = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const room = this.data.room;
    
    // Initialize amenities and preview if editing a room
    if (this.isEdit && room) {
      this.amenities = room.amenities ? [...room.amenities] : [];
      this.previewUrl = this.getInitialImageUrl(room);
    }
    
    // Create the form with initial values
    this.roomForm = this.createRoomForm(room);

    // Listen for imageUrl changes to update preview
    this.setupImagePreviewListener();
  }

  private getInitialImageUrl(room: Room): string | null {
    return room.imageUrl || (room.images?.length ? room.images[0] : null);
  }

  private createRoomForm(room: Room | null): FormGroup {
    const initialImageUrl = room?.images?.length ? room.images[0] : (room?.imageUrl || '');
    
    return this.fb.group({
      name: [room?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [room?.description || '', [Validators.required, Validators.minLength(10)]],
      price: [room?.price || 0, [Validators.required, Validators.min(0)]],
      capacity: [room?.capacity || 1, [Validators.required, Validators.min(1)]],
      size: [room?.size || 0, [Validators.required, Validators.min(1)]],
      beds: [room?.beds || '', [Validators.required]],
      imageUrl: [initialImageUrl, [Validators.required]]
    });
  }

  private setupImagePreviewListener(): void {
    this.roomForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (url && url !== this.previewUrl) {
        this.previewUrl = url;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    
    // Validate file type
    if (!file.type.includes('image/')) {
      alert('Chỉ chấp nhận file hình ảnh!');
      return;
    }
    
    this.createImagePreview(file);
    this.uploadImage(file);
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private uploadImage(file: File): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.imageService.uploadImageWithProgress(file)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        })
      )
      .subscribe({
        next: (result) => {
          this.uploadProgress = result.progress;
          
          if (result.url) {
            // Update form with image URL when upload completes
            this.roomForm.patchValue({ imageUrl: result.url });
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          alert('Lỗi khi tải lên hình ảnh. Vui lòng thử lại.');
        }
      });
  }
  
  // Handle chip input for amenities
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
      this.markFormGroupTouched(this.roomForm);
      return;
    }
    
    const formValue = this.roomForm.value as RoomFormData;
    const room: Partial<Room> = this.prepareRoomData(formValue);
    
    this.dialogRef.close(room);
  }
  
  private prepareRoomData(formValue: RoomFormData): Partial<Room> {
    // Convert imageUrl to images array
    const images = [formValue.imageUrl];
    
    const room: Partial<Room> = {
      ...formValue,
      images,
      amenities: this.amenities,
      available: this.data.room?.available !== undefined ? this.data.room.available : true
    };
    
    // Add id if editing existing room
    if (this.isEdit && this.data.room) {
      room.id = this.data.room.id;
    }
    
    return room;
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}