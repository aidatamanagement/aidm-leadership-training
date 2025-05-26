import React, { useState } from 'react';
import { addStudent } from '@/contexts/services/studentService';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/AppLayout';

const AddUserPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    setLoading(true);
    try {
      await addStudent({ name, email }, password, 'student');
      setName('');
      setEmail('');
      setPassword('');
      alert('User created successfully!');
    } catch (error) {
      alert('Failed to create user.');
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12">
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold mb-6">Add New User</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleAddUser} disabled={!name || !email || !password || loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default AddUserPage; 