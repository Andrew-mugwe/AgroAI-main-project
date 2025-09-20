import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface UploadFormProps {
  onUpload: (file: File, notes: string) => Promise<void>;
  isUploading?: boolean;
  className?: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ 
  onUpload, 
  isUploading = false,
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG or PNG)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    try {
      await onUpload(selectedFile, notes);
      // Reset form on success
      setSelectedFile(null);
      setNotes('');
      setError('');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-8 ${className}`}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Upload Pest Image
        </h2>
        <p className="text-gray-600 text-lg">
          Upload an image of a pest or disease for AI-powered detection and analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload Area */}
        <motion.div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-green-400 bg-green-50 scale-105'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                {preview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                )}
                
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <motion.button
                  type="button"
                  onClick={removeFile}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                  Remove File
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <motion.div
                  className="flex items-center justify-center"
                  animate={{ 
                    scale: dragActive ? 1.1 : 1,
                    rotate: dragActive ? 5 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative">
                    <Camera className="w-16 h-16 text-gray-400" />
                    {dragActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-green-200 opacity-50"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </div>
                </motion.div>
                
                <div>
                  <p className="text-2xl font-semibold text-gray-900 mb-3">
                    Drop your image here
                  </p>
                  <p className="text-lg text-gray-500 mb-6">
                    or click to browse files
                  </p>
                  <motion.div
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-semibold">Choose File</span>
                  </motion.div>
                </div>
                
                <p className="text-sm text-gray-400">
                  Supports JPG, PNG up to 10MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-3">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the location, crop type, or any other relevant information..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
            rows={4}
            disabled={isUploading}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          whileHover={{ scale: isUploading ? 1 : 1.02, y: isUploading ? 0 : -2 }}
          whileTap={{ scale: isUploading ? 1 : 0.98 }}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Analyze Pest
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UploadForm;
