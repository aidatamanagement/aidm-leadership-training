import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

function StudentsList() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StudentProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    setStudents(data || []);
    setLoading(false);
  }

  function startEdit(student: StudentProfile) {
    setEditingId(student.id);
    setEditData({ ...student });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editData.name,
        email: editData.email,
        role: editData.role,
      })
      .eq('id', editingId);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'Student updated.' });
    setEditingId(null);
    setEditData({});
    fetchStudents();
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Students List</h2>
      <GlassCard>
        <div className="divide-y">
          {loading && <div className="p-4 text-center">Loading...</div>}
          {!loading && students.length === 0 && <div className="p-4 text-center text-gray-500">No students found.</div>}
          {students.map(student => (
            <div key={student.id} className="flex items-center justify-between p-4">
              {editingId === student.id ? (
                <>
                  <Input
                    className="mr-2 max-w-xs"
                    value={editData.name || ''}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    placeholder="Name"
                  />
                  <Input
                    className="mr-2 max-w-xs"
                    value={editData.email || ''}
                    onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                    placeholder="Email"
                  />
                  <Input
                    className="mr-2 max-w-xs"
                    value={editData.role || ''}
                    onChange={e => setEditData(d => ({ ...d, role: e.target.value }))}
                    placeholder="Role"
                  />
                  <Button size="sm" className="mr-2" onClick={saveEdit} disabled={loading}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                    <div className="text-xs text-gray-400">{student.role}</div>
                  </div>
                  <Button size="sm" onClick={() => startEdit(student)}>Edit</Button>
                </>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default StudentsList; 