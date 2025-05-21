import React, { useRef, useState } from 'react';
import { FileText, FileUp, X, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface AttachmentHandlerProps {
  /**
   * The ID of the parent entity (contract, wbs, etc.)
   */
  parentId: string;
  /**
   * Custom storage bucket name (defaults to 'attachments')
   */
  storageBucket?: string;
  /**
   * Optional folder path within the bucket
   */
  folderPath?: string;
  /**
   * Current attachments
   */
  attachments: Attachment[];
  /**
   * Callback when attachments list changes
   */
  onAttachmentsChange: (attachments: Attachment[]) => void;
  /**
   * Whether the user can add/delete attachments
   */
  canEdit?: boolean;
  /**
   * Optional label for the file input
   */
  label?: string;
  /**
   * Optional additional class name
   */
  className?: string;
}

/**
 * AttachmentHandler Component
 * 
 * Provides a consistent interface for handling file attachments across the application.
 * Includes file upload, download, preview, and deletion functionality.
 */
export const AttachmentHandler: React.FC<AttachmentHandlerProps> = ({
  parentId,
  storageBucket = 'attachments',
  folderPath = '',
  attachments,
  onAttachmentsChange,
  canEdit = true,
  label = 'Attachments',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Construct the storage path
  const getStoragePath = (fileName: string) => {
    return `${parentId}${folderPath ? `/${folderPath}` : ''}/${fileName}`;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const { error } = await supabase
          .storage
          .from(storageBucket)
          .upload(getStoragePath(file.name), file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        // Get URL for the uploaded file
        const { data: urlData } = await supabase
          .storage
          .from(storageBucket)
          .createSignedUrl(getStoragePath(file.name), 3600);

        return {
          name: file.name,
          url: typeof urlData?.signedUrl === 'string' && urlData.signedUrl.length > 0 ? urlData.signedUrl : '',
          type: file.type,
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onAttachmentsChange([...attachments, ...uploadedFiles]);
      toast.success(`${files.length} file(s) uploaded successfully`);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete attachment
  const deleteAttachment = async (fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const { error } = await supabase
        .storage
        .from(storageBucket)
        .remove([getStoragePath(fileName)]);

      if (error) throw error;

      onAttachmentsChange(attachments.filter(a => a.name !== fileName));
      toast.success(`File deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <img src="/icons/image-file.svg" alt="Image" className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <img src="/icons/pdf-file.svg" alt="PDF" className="h-5 w-5" />;
    if (fileType.includes('word') || fileType.includes('document')) return <img src="/icons/doc-file.svg" alt="Document" className="h-5 w-5" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <img src="/icons/xls-file.svg" alt="Spreadsheet" className="h-5 w-5" />;
    return <FileText size={18} />;
  };

  return (
    <div className={`mt-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{label}</h3>

      {/* File upload input */}
      {canEdit && (
        <div className="mb-4">
          <label
            className={`flex items-center justify-center w-full p-2 border border-dashed border-gray-600 rounded-md cursor-pointer hover:border-primary transition-colors ${isUploading ? 'bg-gray-800 opacity-50' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => { void handleFileUpload(e); }}
              multiple
              className="hidden"
              disabled={isUploading}
            />
            <FileUp size={18} className="mr-2 text-gray-400" />
            <span className="text-sm text-gray-400">
              {isUploading ? 'Uploading...' : 'Upload files'}
            </span>
          </label>
        </div>
      )}

      {/* Attachments list */}
      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-gray-800 rounded-md"
            >
              <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 mr-2">
                  {getFileIcon(file.type)}
                </span>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {file.type.startsWith('image/') && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Preview image"
                    title="Preview image"
                  >
                    <Eye size={16} />
                  </a>
                )}
                <a
                  href={file.url}
                  download={file.name}
                  className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Download file"
                  title="Download file"
                >
                  <Download size={16} />
                </a>
                {canEdit && (
                  <button
                    onClick={() => { void deleteAttachment(file.name); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Delete file"
                    title="Delete file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500 bg-gray-800/50 rounded-md">
          <FileText size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments</p>
        </div>
      )}
    </div>
  );
};

export default AttachmentHandler;
