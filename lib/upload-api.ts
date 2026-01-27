import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app';

export interface UploadedFile {
  url: string;
  public_id: string;
  original_filename: string;
  format: string;
  resource_type: string;
  bytes: number;
  secure_url?: string;
}

export interface UploadOptions {
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  transformation?: any;
}

export class UploadAPI {
  static async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add options as form data if needed
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.resourceType) {
      formData.append('resource_type', options.resourceType);
    }

    try {
      // Use /upload-raw endpoint for documents (raw resource type), /upload for images/videos
      const endpoint = options.resourceType === 'raw' 
        ? `${API_BASE_URL}/api/v1/upload-raw`
        : `${API_BASE_URL}/api/v1/upload`;
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Upload API Error:', error);
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  }

  static async uploadMultipleFiles(files: File[], options: UploadOptions = {}): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  static getFileType(file: File): 'image' | 'video' | 'document' | 'other' {
    const mimeType = file.type;
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf' || 
        mimeType === 'application/msword' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'text/plain') return 'document';
    
    return 'other';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static validateFile(file: File, maxSize: number = 10, allowedTypes: string[] = []): string | null {
    // Check file size (maxSize in MB)
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if restrictions are provided
    if (allowedTypes.length > 0) {
      const fileType = this.getFileType(file);
      if (!allowedTypes.includes(fileType)) {
        return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  }
}

export default UploadAPI;

