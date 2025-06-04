import React, { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'

interface UploadFileModalProps {
  student: { id: string; name: string; email: string }
  onClose: () => void
}

export default function UploadFileModal({ student, onClose }: UploadFileModalProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleUpload() {
    if (!file || !user) return
    setIsLoading(true)
    // Generate unique filename
    const ext = file.name.split('.')?.pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `${student.id}/${uniqueName}`
    // 1. Upload to storage with upsert
    const { error: uploadError } = await supabase.storage
      .from('student-files')
      .upload(filePath, file, { upsert: true })
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' })
      setIsLoading(false)
      return
    }
    // 2. Insert file metadata (store original name and description)
    const { data, error } = await supabase
      .from('files')
      .insert({
        student_id: student.id,
        uploader_id: user.id,
        name: file.name, // original filename
        path: filePath,  // storage path
        type: file.type,
        description,
      })
      .select()
      .single()
    if (error || !data) {
      toast({ title: 'DB insert failed', description: error?.message, variant: 'destructive' })
      setIsLoading(false)
      return
    }
    setIsLoading(false)
    toast({ title: 'File uploaded', description: 'File uploaded.' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
        <div className="mb-4">
          <div className="font-bold text-lg">{student.name}</div>
          <div className="text-sm text-gray-500">{student.email}</div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select File</label>
          <input
            type="file"
            className="w-full"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] text-sm"
            placeholder="Add a description for this file (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  )
} 