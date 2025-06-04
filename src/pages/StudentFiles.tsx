import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { FileType } from '@/contexts/types/DataTypes'
import { MessageCircle, Eye, Download, X } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect as useReactEffect } from 'react'

function getFileIcon(type: string) {
  if (type.includes('pdf')) return <span className="text-red-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" /><path d="M14 2v6h6" /></svg></span>
  if (type.includes('video')) return <span className="text-purple-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M4 6.5v11a1.5 1.5 0 0 0 2.25 1.299l9.5-5.5a1.5 1.5 0 0 0 0-2.598l-9.5-5.5A1.5 1.5 0 0 0 4 6.5z" /></svg></span>
  if (type.includes('doc') || type.includes('word')) return <span className="text-blue-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" /><path d="M14 2v6h6" /></svg></span>
  return <span className="text-gray-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="14" x="3" y="5" rx="2" /></svg></span>
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes > 1e3) return (bytes / 1e3).toFixed(1) + ' KB'
  return bytes + ' B'
}

// AnimatedCard component for expansion animation
function AnimatedCard({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// FilePreview component for all file types
function FilePreview({ file }: { file: FileType }) {
  const publicUrl = supabase.storage.from('student-files').getPublicUrl(file.path).data.publicUrl
  const [textContent, setTextContent] = useState<string | null>(null)

  useReactEffect(() => {
    if (file.type.startsWith('text/')) {
      fetch(publicUrl)
        .then(res => res.text())
        .then(setTextContent)
        .catch(() => setTextContent('Could not load text file.'))
    }
  }, [file, publicUrl])

  if (file.type.startsWith('image/')) {
    return (
      <img
        src={publicUrl}
        alt={file.name}
        className="rounded border max-h-64 object-contain mx-auto mb-4"
        style={{ background: '#f8f8f8' }}
      />
    )
  }
  if (file.type === 'application/pdf') {
    return (
      <iframe
        src={publicUrl}
        title={file.name}
        className="w-full h-64 rounded border mb-4"
      />
    )
  }
  if (file.type.startsWith('video/')) {
    return (
      <video
        src={publicUrl}
        controls
        className="w-full max-h-64 rounded border mb-4"
      />
    )
  }
  if (file.type.startsWith('audio/')) {
    return (
      <audio
        src={publicUrl}
        controls
        className="w-full mb-4"
      />
    )
  }
  if (file.type.startsWith('text/')) {
    return (
      <div className="w-full max-h-64 overflow-auto bg-gray-50 rounded border p-2 font-mono text-xs mb-4 whitespace-pre-wrap">
        {textContent === null ? 'Loading...' : textContent}
      </div>
    )
  }
  return (
    <div className="text-gray-500 text-center mb-4">
      No preview available for this file type.
    </div>
  )
}

function StudentFileGrid() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileType[]>([])
  const [search, setSearch] = useState('')
  const [openChatFileId, setOpenChatFileId] = useState<string | null>(null)
  const [viewFile, setViewFile] = useState<FileType | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchFiles() {
      // 1. Fetch all files for the student, including uploader name
      const { data: filesData } = await supabase
        .from('files')
        .select('*, uploader:profiles!uploader_id(id, name)')
        .eq('student_id', user.id)
      setFiles(filesData || [])
    }
    fetchFiles()
  }, [user])
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleDownload(file: FileType) {
    const publicUrl = supabase.storage.from('student-files').getPublicUrl(file.path).data.publicUrl
    fetch(publicUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      })
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Files Shared</h1>
          <input
            type="text"
            placeholder="Search files..."
            className="border rounded px-3 py-2 w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredFiles.map(file => (
            <div key={file.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg hover:border-green-200 border border-transparent cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                {getFileIcon(file.type)}
                <span className="font-bold text-lg truncate max-w-[10rem]" title={file.name}>{file.name}</span>
                <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                  {file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'VIDEO' : file.type.includes('doc') ? 'DOCUMENT' : 'FILE'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                by {file.uploader?.name || 'Admin'}
              </div>
              <div className="text-xs text-gray-400 mb-2">{file.uploaded_at?.slice(0, 10)}</div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100"
                  title="View"
                  onClick={() => setViewFile(file)}
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100"
                  title="Download"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {viewFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <AnimatedCard className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 flex flex-col">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
                  onClick={() => setViewFile(null)}
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  {getFileIcon(viewFile.type)}
                  <span className="font-bold text-xl break-all" title={viewFile.name}>{viewFile.name}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                    {viewFile.type.includes('pdf') ? 'PDF' : viewFile.type.includes('video') ? 'VIDEO' : viewFile.type.includes('doc') ? 'DOCUMENT' : 'FILE'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  by {viewFile.uploader?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-400 mb-2">{viewFile.uploaded_at?.slice(0, 10)}</div>
                <div className="mb-2">
                  <span className="font-semibold">Type:</span> {viewFile.type}<br />
                </div>
                {viewFile.description && (
                  <div className="mb-4">
                    <span className="font-semibold">Description:</span> {viewFile.description} <br />
                  </div>
                )}
                {/* File preview for all types */}
                <FilePreview file={viewFile} />
                <div className="flex gap-2 mt-auto">
                  <a
                    href={supabase.storage.from('student-files').getPublicUrl(viewFile.path).data.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded hover:bg-gray-100 border"
                    title="Open in new tab"
                  >
                    View Full
                  </a>
                  <button
                    type="button"
                    className="p-2 rounded hover:bg-gray-100 border"
                    title="Download"
                    onClick={() => handleDownload(viewFile)}
                  >
                    Download
                  </button>
                </div>
              </AnimatedCard>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}

export default StudentFileGrid 