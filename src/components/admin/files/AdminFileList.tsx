import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { FileType } from '@/contexts/types/DataTypes'
import { Button } from '@/components/ui/button'
import { Pencil, Download, Eye, X } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminFileListProps {
  studentId: string | null
}

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

  useEffect(() => {
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

export function AdminFileList({ studentId }: AdminFileListProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingFile, setEditingFile] = useState<FileType | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewFile, setViewFile] = useState<FileType | null>(null)

  function openEdit(file: FileType) {
    setEditingFile(file)
    setEditName(file.name)
    setEditType(file.type)
    setEditDescription(file.description || '')
  }

  function closeEdit() {
    setEditingFile(null)
    setEditName('')
    setEditType('')
    setEditDescription('')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditFile(file)
    setEditName(file.name)
    setEditType(file.type)
  }

  async function handleSave() {
    if (!editingFile) return
    setSaving(true)
    let newPath = editingFile.path
    let newName = editName
    let newType = editType
    let newDescription = editDescription
    // If a new file is selected, upload it
    if (editFile) {
      setUploading(true)
      const ext = editFile.name.split('.').pop()
      const filePath = `student-files/${editingFile.student_id}/${Date.now()}-${editFile.name}`
      const { error: uploadError } = await supabase.storage.from('student-files').upload(filePath, editFile, { upsert: true })
      setUploading(false)
      if (uploadError) {
        toast({ title: 'Upload error', description: uploadError.message, variant: 'destructive' })
        setSaving(false)
        return
      }
      newPath = filePath
      newName = editFile.name
      newType = editFile.type
    }
    const { error } = await supabase
      .from('files')
      .update({ name: newName, type: newType, path: newPath, description: newDescription })
      .eq('id', editingFile.id)
    setSaving(false)
    setEditFile(null)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: 'File updated', description: 'File details updated successfully.' })
    closeEdit()
    // Refresh files
    setIsLoading(true)
    const { data, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false })
    if (!fetchError && data) setFiles(data)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!studentId) return
    setIsLoading(true)
    supabase
      .from('files')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setFiles(data)
        setIsLoading(false)
      })
  }, [studentId])

  if (!studentId) return null
  if (isLoading) return <div>Loading files...</div>
  if (!files.length) return <div>No files found.</div>

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {files.map(file => {
          const fullPath = file.path
          return (
            <div key={file.id} className="bg-white rounded-lg shadow p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg hover:border-green-200 border border-transparent">
              <div className="flex items-center gap-3 mb-2">
                {getFileIcon(file.type)}
                <span className="font-bold text-lg truncate max-w-[10rem]" title={file.name}>{file.name}</span>
                <span className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                  {file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'VIDEO' : file.type.includes('doc') ? 'DOCUMENT' : 'FILE'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {file.description || 'No description'}
              </div>
              <div className="text-xs text-gray-400 mb-2">{new Date(file.uploaded_at).toLocaleString()}</div>
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
                  title="Edit"
                  onClick={() => openEdit(file)}
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="p-2"
                  title="Download"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = supabase.storage.from('student-files').getPublicUrl(fullPath).data.publicUrl
                    a.download = file.name
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                  }}
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit File Dialog */}
      <Dialog open={!!editingFile} onOpenChange={open => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="edit-file-name" className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
              <Input id="edit-file-name" value={editName} onChange={e => setEditName(e.target.value)} placeholder="File name" />
            </div>
            <div>
              <label htmlFor="edit-file-type" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <Input id="edit-file-type" value={editType} onChange={e => setEditType(e.target.value)} placeholder="File type (e.g. application/pdf)" />
            </div>
            <div>
              <label htmlFor="edit-file-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="edit-file-description"
                className="w-full border rounded p-2 min-h-[60px] text-sm"
                placeholder="Add a description for this file (optional)"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                maxLength={500}
              />
            </div>
            <div>
              <label htmlFor="edit-file-upload" className="block text-sm font-medium text-gray-700 mb-1">Replace File</label>
              <input id="edit-file-upload" type="file" accept="*" onChange={handleFileChange} className="block w-full text-sm text-gray-500" />
              {editFile && <div className="text-xs text-green-600 mt-1">Selected: {editFile.name}</div>}
            </div>
            {uploading && <div className="text-xs text-blue-600">Uploading new file...</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={saving || uploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading || !editName || !editType}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View File Dialog */}
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
                {viewFile.description || 'No description'}
              </div>
              <div className="text-xs text-gray-400 mb-2">{new Date(viewFile.uploaded_at).toLocaleString()}</div>
              <div className="mb-2">
                <span className="font-semibold">Type:</span> {viewFile.type}<br />
              </div>
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
                <Button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100 border"
                  title="Download"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = supabase.storage.from('student-files').getPublicUrl(viewFile.path).data.publicUrl
                    a.download = viewFile.name
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                  }}
                >
                  Download
                </Button>
              </div>
            </AnimatedCard>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminFileList 