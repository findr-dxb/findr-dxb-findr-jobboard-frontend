"use client"

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, Image, Video, FileIcon } from "lucide-react";
import { UploadAPI, type UploadedFile, type UploadOptions } from "@/lib/upload-api";

interface FileUploadProps {
  onUploadSuccess: (fileData: any) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  allowedTypes?: ('image' | 'video' | 'document')[];
  className?: string;
  placeholder?: string;
  currentFile?: string | null;
}

// Using UploadedFile from the API utility

export function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = "*/*",
  maxSize = 10,
  multiple = false,
  allowedTypes = ['image', 'video', 'document'],
  className = "",
  placeholder = "Upload file",
  currentFile = null
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getAcceptedTypes = () => {
    const typeMap = {
      image: '.jpg,.jpeg,.png,.gif,.webp',
      video: '.mp4,.avi,.mov,.wmv,.flv,.webm',
      document: '.pdf,.doc,.docx,.txt,.rtf'
    };
    
    if (accept !== "*/*") return accept;
    
    return allowedTypes.map(type => typeMap[type]).join(',');
  };

  const getFileIcon = (fileType: string, resourceType: string) => {
    if (resourceType === 'image') return <Image className="w-6 h-6 text-blue-500" />;
    if (resourceType === 'video') return <Video className="w-6 h-6 text-purple-500" />;
    if (fileType === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
    return <FileIcon className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = UploadAPI.formatFileSize;

  const validateFile = (file: File): string | null => {
    return UploadAPI.validateFile(file, maxSize, allowedTypes);
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      const error = validation;
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);

    try {
      // Determine file type to use appropriate upload endpoint
      const fileType = UploadAPI.getFileType(file);
      const isDocument = fileType === 'document';
      
      // Use raw upload for documents (resume and other documents), auto for images/videos
      const uploadedFile: UploadedFile = await UploadAPI.uploadFile(file, {
        folder: 'findr_uploads',
        resourceType: isDocument ? 'raw' : 'auto'
      });
      
      // Ensure original filename is preserved
      const enhancedUploadedFile = {
        ...uploadedFile,
        original_filename: uploadedFile.original_filename || file.name,
        clientOriginalName: file.name // Add the client-side filename as backup
      };
      
      if (multiple) {
        setUploadedFiles(prev => [...prev, enhancedUploadedFile]);
      } else {
        setUploadedFiles([enhancedUploadedFile]);
      }

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      onUploadSuccess(enhancedUploadedFile);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed. Please try again.';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "Multiple Files Not Allowed",
        description: "Please select only one file.",
        variant: "destructive",
      });
      return;
    }

    fileArray.forEach(file => {
      uploadFile(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-emerald-400 bg-emerald-50' 
            : uploadedFiles.length > 0 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
            <p className="text-emerald-600 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{placeholder}</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Drag and drop files here, or click to browse
            </p>
            <Button 
              type="button"
              variant="outline" 
              disabled={isUploading}
              className="bg-white"
            >
              Choose {multiple ? 'Files' : 'File'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: {maxSize}MB. Types: {allowedTypes.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Current File Display */}
      {currentFile && uploadedFiles.length === 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-medium text-sm">Current file uploaded</p>
          <p className="text-blue-600 text-xs">{currentFile}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.format, file.resource_type)}
                <div>
                  <p className="text-green-800 font-medium text-sm">
                    {file.original_filename || 'Uploaded file'}
                  </p>
                  <p className="text-green-600 text-xs">
                    {formatFileSize(file.bytes)} • {file.format?.toUpperCase()}
                  </p>
                </div>
              </div>
              {multiple && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
