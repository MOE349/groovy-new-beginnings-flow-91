/**
 * @deprecated This component has been replaced by FilesManager with simple mode
 * 
 * Migration:
 * 
 * OLD:
 * import FileUpload from '@/components/FileUpload';
 * <FileUpload multiple={true} maxSize={25} onFileUploaded={handleFiles} />
 * 
 * NEW:
 * import { FilesManager } from '@/components/FilesManager';
 * <FilesManager simple={true} multiple={true} maxSize={25} onFileUploaded={handleFiles} />
 * 
 * The new component provides the same API with additional features and consistency.
 */

import React from 'react';
import { FilesManager } from './FilesManager';

interface FileUploadProps {
  multiple?: boolean;
  onFileUploaded?: (fileIds: string[]) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

/**
 * @deprecated Use FilesManager with simple={true} instead
 */
const FileUpload: React.FC<FileUploadProps> = (props) => {
  console.warn('FileUpload is deprecated. Please use FilesManager with simple={true} instead.');
  
  return <FilesManager {...props} simple={true} />;
};

export default FileUpload;
