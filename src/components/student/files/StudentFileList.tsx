import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { FileType } from '@/contexts/types/DataTypes'
import { Button } from '@/components/ui/button'
import { Pencil, Download } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

interface StudentFileListProps {
  studentId: string | null
}

export function StudentFileList({ studentId }: StudentFileListProps) {
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingFile, setEditingFile] = useState<FileType | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  function isAdminPage() {
    return typeof window !== 'undefined' && window.location.pathname.includes('admin')
  }

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
      // Optionally: delete old file from storage (not implemented here)
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

  function handleBack() {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {files.map(file => {
          const fullPath = file.path
          return (
            <div key={file.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="truncate overflow-hidden whitespace-nowrap max-w-[10rem]" title={file.name}>
                      {file.name}
                    </span>
                    {isAdminPage() && (
                      <button onClick={() => openEdit(file)} className="ml-1 text-gray-400 hover:text-blue-600" title="Edit file details">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{file.type} • {new Date(file.uploaded_at).toLocaleString()}</div>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="ml-4"
                >
                  <a
                    href={supabase.storage.from('student-files').getPublicUrl(fullPath).data.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
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
    </>
  )
}

export default StudentFileList 