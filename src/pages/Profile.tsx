import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, UploadCloud, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editOrg, setEditOrg] = useState(user.organization || '');
  const [editOrgRole, setEditOrgRole] = useState(user.organization_role || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.profile_image || '');

  // Get initials from user's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName, organization: editOrg, organization_role: editOrgRole })
        .eq('id', user.id);
      if (error) throw error;
      toast({ title: 'Profile updated', description: 'Your profile information was updated.' });
      setIsEditOpen(false);
      // Optionally, refresh user context here
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message || 'Could not update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.FormEvent) {
    e.preventDefault();
    // Validate file
    if (!avatarFile || !(avatarFile instanceof File) || avatarFile.size === 0) {
      toast({ title: 'Invalid file', description: 'Please select a valid image file.', variant: 'destructive' });
      setIsUploadingAvatar(false);
      return;
    }
    if (!avatarFile.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Only image files are allowed.', variant: 'destructive' });
      setIsUploadingAvatar(false);
      return;
    }
    if (avatarFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      setIsUploadingAvatar(false);
      return;
    }
    setIsUploadingAvatar(true);
    try {
      // Ensure filename starts with user.id to comply with RLS policy
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      console.log('Uploading file:', avatarFile, 'as', fileName);
      // Upload to Supabase Storage (profile-images bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, avatarFile, {
          upsert: true,
          contentType: avatarFile.type || 'image/png',
        });
      console.log('Upload result:', uploadData, uploadError);
      if (uploadError) throw uploadError;
      // Get signed URL for private bucket
      const { data: urlData, error: urlError } = await supabase.storage
        .from('profile-images')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);
      if (urlError) throw urlError;
      // Update profile table with new image URL (profile_image must exist in your schema)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: urlData.signedUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(urlData.signedUrl);
      toast({ title: 'Profile picture updated', description: 'Your new profile picture is now active.' });
      setIsAvatarDialogOpen(false);
      setAvatarFile(null);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message || 'Could not upload image', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <GlassCard variant="featured" className="p-0 overflow-hidden shadow-2xl min-h-[420px]">
          <div className="flex flex-col md:flex-row items-center md:items-stretch">
            {/* Left: Avatar and Name */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white/60 to-white/30 md:w-1/3 p-10 gap-6 border-b md:border-b-0 md:border-r border-white/20">
              <div className="relative group cursor-pointer" onClick={() => setIsAvatarDialogOpen(true)}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-36 w-36 rounded-full object-cover border-4 border-white/30 shadow-xl transition-all duration-200 group-hover:brightness-90"
                  />
                ) : (
                  <Avatar className="h-36 w-36 border-4 border-white/30 shadow-xl">
                    <AvatarFallback className="text-4xl bg-white/20 text-gray-800 flex items-center justify-center">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
                )}
                <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 shadow group-hover:bg-primary group-hover:text-white transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 text-center">{user.name}</h1>
              <p className="text-gray-500 text-center text-base">{user.email}</p>
              <span className="inline-block mt-2 px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Active</span>
            </div>
            {/* Right: Details */}
            <div className="flex-1 flex flex-col justify-between p-10 gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Role</h3>
                  <div className="text-xl font-semibold text-gray-900 capitalize">{user.type}</div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Organization</h3>
                  <div className="text-xl font-semibold text-gray-900">{user.organization || '-'}</div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Role in Organization</h3>
                  <div className="text-xl font-semibold text-gray-900">{user.organization_role || '-'}</div>
                </div>
                {/* <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">User ID</h3>
                  <div className="text-xs font-mono text-gray-400 break-all">{user.id}</div>
                </div> */}
              </div>
              <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button 
                variant="destructive" 
                  className="w-full sm:w-auto hover:bg-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditOpen(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSaveProfile()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} required maxLength={64} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Organization</label>
              <Input value={editOrg} onChange={e => setEditOrg(e.target.value)} maxLength={64} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role in Organization</label>
              <Input value={editOrgRole} onChange={e => setEditOrgRole(e.target.value)} maxLength={64} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAvatarUpload} className="flex flex-col items-center gap-6">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <UploadCloud className="w-10 h-10 text-primary" />
              <span className="text-sm text-gray-600">Choose a new profile image</span>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                required
              />
              {avatarFile && <span className="text-xs text-gray-500 mt-1">{avatarFile.name}</span>}
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAvatarDialogOpen(false)} disabled={isUploadingAvatar}>Cancel</Button>
              <Button type="submit" disabled={isUploadingAvatar || !avatarFile}>{isUploadingAvatar ? 'Uploading...' : 'Upload'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Profile; 