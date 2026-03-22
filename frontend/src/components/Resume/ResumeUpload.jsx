import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadResume } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useJobs } from '../../context/JobContext.jsx';
import toast from 'react-hot-toast';

export default function ResumeUpload({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const { loadJobs } = useJobs();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);
    try {
      await uploadResume(user.email, file);
      setStatus('success');
      updateUser({ hasResume: true });
      toast.success('Resume uploaded! Reloading job matches...');
      await loadJobs();
      setTimeout(() => onSuccess?.(), 1200);
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.error || 'Upload failed. Try a .txt file.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [user?.email, updateUser, loadJobs, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="glass rounded-2xl p-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.25)' }}>
          <FileText size={18} className="text-teal-400" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {user?.hasResume ? 'Update Resume' : 'Upload Resume'}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            AI will match jobs against your resume
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className="rounded-xl p-8 text-center cursor-pointer transition-all"
        style={{
          border: `2px dashed ${isDragActive ? '#2DD4BF' : status === 'success' ? '#2DD4BF' : 'rgba(255,255,255,0.1)'}`,
          background: isDragActive ? 'rgba(45,212,191,0.05)' : status === 'success' ? 'rgba(45,212,191,0.05)' : 'rgba(255,255,255,0.02)',
        }}>
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader size={28} className="text-teal-400 animate-spin" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Parsing and uploading…</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={28} className="text-teal-400" />
            <p className="text-sm" style={{ color: '#2DD4BF' }}>Resume uploaded successfully!</p>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={28} style={{ color: '#F87171' }} />
            <p className="text-sm" style={{ color: '#F87171' }}>Upload failed. Try again.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={28} style={{ color: isDragActive ? '#2DD4BF' : 'var(--text-muted)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: isDragActive ? '#2DD4BF' : 'var(--text-primary)' }}>
                {isDragActive ? 'Drop it here' : 'Drag & drop your resume'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF or TXT · Max 5MB</p>
            </div>
            <button className="btn-teal px-4 py-2 rounded-lg text-xs font-medium">
              Browse files
            </button>
          </div>
        )}
      </div>

      {user?.hasResume && (
        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Uploading a new file will replace your current resume
        </p>
      )}
    </div>
  );
}
