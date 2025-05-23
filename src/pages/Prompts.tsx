import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Search, Check, Heart, HeartOff, Maximize2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Prompt {
  id?: string;
  title: string;
  context: string;
  role: string;
  interview?: string;
  task: string;
  boundaries?: string;
  reasoning?: string;
}

const STATIC_PROMPTS: Prompt[] = [
  {
    title: 'New Hire Email Welcome',
    context: 'We want to standardize the welcome email sent to new employees.',
    role: 'You are an internal HR assistant specializing in employee communication.',
    interview: 'Ask me for any missing details about company values or tone.',
    task: 'Draft a warm, professional welcome email for new hires that includes team introduction, first-day expectations, and contact information.',
    boundaries: 'Keep it under 200 words and avoid listing technical setup instructions.'
  },
  {
    title: 'Customer FAQ Drafting',
    context: 'We need to update our FAQ page to address top customer concerns about shipping and returns.',
    role: 'You are a customer support content writer for a mid-size eCommerce company.',
    interview: 'Ask which products or regions need clarification.',
    task: 'Write 5 concise FAQ entries with friendly, informative answers.',
    reasoning: 'After each answer, include a note on why this information is important to include.'
  },
  {
    title: 'Internal Training Summary',
    context: 'Managers often need a quick reference after our internal training sessions.',
    role: 'You are an internal training assistant summarizing session materials.',
    interview: 'Ask what the training covered and who the audience is.',
    task: 'Generate a 1-page executive summary from the uploaded training slides.',
    boundaries: 'Avoid jargon or detailed definitions; keep it high-level.'
  }
];

const Prompts: React.FC = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Prompt>({
    title: '',
    context: '',
    role: '',
    interview: '',
    task: '',
    boundaries: '',
    reasoning: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [visiblePrompts, setVisiblePrompts] = useState(6);
  const [expandedPrompt, setExpandedPrompt] = useState<Prompt | null>(null);

  // Fetch prompts and favorites
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .order('id', { ascending: false });
        
        if (promptsError) throw promptsError;
        setPrompts(promptsData || []);

        // Fetch favorites if user is not admin
        if (user && user.type !== 'admin') {
          const { data: favoritesData, error: favoritesError } = await supabase
            .from('favorites')
            .select('prompt_id')
            .eq('user_id', user.id);
          
          if (favoritesError) throw favoritesError;
          setFavorites(favoritesData?.map(f => f.prompt_id) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Toggle favorite
  const toggleFavorite = async (promptId: string) => {
    if (!user || user.type === 'admin') return;

    try {
      const isFavorite = favorites.includes(promptId);
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId);
        
        if (error) throw error;
        setFavorites(favorites.filter(id => id !== promptId));
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, prompt_id: promptId }]);
        
        if (error) throw error;
        setFavorites([...favorites, promptId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('prompts').insert([{ ...form }]);
    if (error) {
      setError('Failed to add prompt');
    } else {
      setForm({ title: '', context: '', role: '', interview: '', task: '', boundaries: '', reasoning: '' });
      // Refresh prompts
      const { data } = await supabase.from('prompts').select('*').order('id', { ascending: false });
      setPrompts(data || []);
    }
    setSubmitting(false);
  };

  // Handle edit button click
  const handleEdit = (prompt: Prompt) => {
    setEditId(prompt.id || null);
    setEditForm({ ...prompt });
  };

  // Handle edit form input
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editForm) return;
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('prompts').update(editForm).eq('id', editId);
    if (error) {
      setError('Failed to update prompt');
    } else {
      setEditId(null);
      setEditForm(null);
      // Refresh prompts
      const { data } = await supabase.from('prompts').select('*').order('id', { ascending: false });
      setPrompts(data || []);
    }
    setSubmitting(false);
  };

  // Add copy function
  const handleCopyPrompt = (prompt: Prompt) => {
    const promptText = [
      prompt.title,
      prompt.context && `Context: ${prompt.context}`,
      prompt.role && `Role: ${prompt.role}`,
      prompt.interview && `Interview: ${prompt.interview}`,
      prompt.task && `Task: ${prompt.task}`,
      prompt.boundaries && `Boundaries: ${prompt.boundaries}`,
      prompt.reasoning && `Reasoning: ${prompt.reasoning}`
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedId(prompt.id || 'static-' + prompt.title);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy prompt');
    });
  };

  // Decide which prompts to show
  const showPrompts: Prompt[] =
    user?.type === 'admin'
      ? prompts
      : prompts.length > 0
        ? prompts
        : STATIC_PROMPTS;

  // Filter prompts by search and favorites
  const filteredPrompts = showPrompts.filter((prompt) => {
    const matchesSearch = (
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      (prompt.context && prompt.context.toLowerCase().includes(search.toLowerCase())) ||
      (prompt.role && prompt.role.toLowerCase().includes(search.toLowerCase())) ||
      (prompt.task && prompt.task.toLowerCase().includes(search.toLowerCase()))
    );

    if (showFavorites) {
      return matchesSearch && favorites.includes(prompt.id || '');
    }
    return matchesSearch;
  });

  // Reset visible prompts when search or favorites filter changes
  useEffect(() => {
    setVisiblePrompts(6);
  }, [search, showFavorites]);

  const handleShowMore = () => {
    setVisiblePrompts(prev => prev + 6);
  };

  const displayedPrompts = filteredPrompts.slice(0, visiblePrompts);
  const hasMorePrompts = filteredPrompts.length > visiblePrompts;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Prompts</h1>
        {user?.type === 'admin' && (
          <>
            <GlassCard className="mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Prompt</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
                  <Input name="context" value={form.context} onChange={handleChange} placeholder="Context" />
                  <Input name="role" value={form.role} onChange={handleChange} placeholder="Role" />
                  <Input name="interview" value={form.interview} onChange={handleChange} placeholder="Interview" />
                </div>
                <div className="space-y-2">
                  <Textarea name="task" value={form.task} onChange={handleChange} placeholder="Task" rows={3} />
                  <Textarea name="boundaries" value={form.boundaries} onChange={handleChange} placeholder="Boundaries" rows={2} />
                  <Textarea name="reasoning" value={form.reasoning} onChange={handleChange} placeholder="Reasoning" rows={2} />
                </div>
                <div className="md:col-span-2 flex flex-col md:flex-row md:items-center gap-2 mt-2">
                  <Button type="submit" variant="success" disabled={submitting} className="w-full md:w-auto">{submitting ? 'Adding...' : 'Add Prompt'}</Button>
                  {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
                </div>
              </form>
            </GlassCard>
            <div className="my-8 border-t border-gray-200" />
            <h2 className="text-xl font-semibold mb-4">All Prompts</h2>
          </>
        )}
        
        {/* Search and Favorites Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="pl-10"
            />
          </div>
          {user?.type !== 'admin' && (
            <Button
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(!showFavorites)}
              className="whitespace-nowrap"
            >
              {showFavorites ? (
                <>
                  <HeartOff className="h-4 w-4 mr-2" />
                  Show All
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Show Favorites
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500">Loading prompts...</div>
          ) : displayedPrompts.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              {showFavorites ? "No favorite prompts found." : "No prompts found."}
            </div>
          ) : (
            <>
              {displayedPrompts.map((prompt, idx) => (
                <GlassCard 
                  key={prompt.id || idx} 
                  className="p-4 flex flex-col space-y-2 border border-gray-200 h-full cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedPrompt(prompt)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-base text-gray-900 line-clamp-1">{prompt.title}</div>
                    <div className="flex items-center gap-2">
                      {user?.type !== 'admin' && prompt.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(prompt.id!);
                          }}
                          title={favorites.includes(prompt.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${favorites.includes(prompt.id!) ? 'fill-green-500 text-green-500' : 'text-gray-400'}`} 
                          />
                        </Button>
                      )}
                      {user?.type === 'admin' && prompt.id && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prompt);
                          }} 
                          title="Edit Prompt"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {editId === prompt.id && editForm ? (
                    <form onSubmit={handleEditSubmit} className="space-y-2">
                      <Input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" required />
                      <Input name="context" value={editForm.context || ''} onChange={handleEditChange} placeholder="Context" />
                      <Input name="role" value={editForm.role || ''} onChange={handleEditChange} placeholder="Role" />
                      <Input name="interview" value={editForm.interview || ''} onChange={handleEditChange} placeholder="Interview" />
                      <Textarea name="task" value={editForm.task || ''} onChange={handleEditChange} placeholder="Task" rows={2} />
                      <Textarea name="boundaries" value={editForm.boundaries || ''} onChange={handleEditChange} placeholder="Boundaries" rows={2} />
                      <Textarea name="reasoning" value={editForm.reasoning || ''} onChange={handleEditChange} placeholder="Reasoning" rows={2} />
                      <div className="flex gap-2 mt-2">
                        <Button type="submit" variant="success" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                        <Button type="button" variant="outline" onClick={() => { setEditId(null); setEditForm(null); }}>Cancel</Button>
                      </div>
                      {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
                    </form>
                  ) : (
                    <>
                      {prompt.context && <div className="text-gray-600 text-sm mb-1 line-clamp-2">{prompt.context}</div>}
                      {prompt.role && <div className="text-gray-700 text-sm line-clamp-1"><span className="font-medium">Role:</span> {prompt.role}</div>}
                      {prompt.interview && <div className="text-gray-700 text-sm line-clamp-1"><span className="font-medium">Interview:</span> {prompt.interview}</div>}
                      {prompt.task && <div className="text-gray-700 text-sm line-clamp-2"><span className="font-medium">Task:</span> {prompt.task}</div>}
                      {prompt.boundaries && <div className="text-gray-700 text-sm line-clamp-1"><span className="font-medium">Boundaries:</span> {prompt.boundaries}</div>}
                      {prompt.reasoning && <div className="text-gray-700 text-sm line-clamp-1"><span className="font-medium">Reasoning:</span> {prompt.reasoning}</div>}
                      <Button 
                        variant="success" 
                        className="w-full mt-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(prompt);
                        }}
                      >
                        {copiedId === (prompt.id || 'static-' + prompt.title) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          'Copy Prompt'
                        )}
                      </Button>
                    </>
                  )}
                </GlassCard>
              ))}
            </>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
          {hasMorePrompts && (
            <Button
              variant="outline"
              onClick={handleShowMore}
              className="px-8 text-gray-700 hover:text-gray-900"
            >
              Show More Prompts
            </Button>
          )}
          {visiblePrompts > 6 && (
            <div>
              <Button
                variant="outline"
                onClick={() => setVisiblePrompts(6)}
                className="px-8 text-gray-700 hover:text-gray-900"
              >
                Show Less
              </Button>
            </div>
          )}
        </div>

        {/* Expanded Prompt Dialog */}
        <Dialog open={!!expandedPrompt} onOpenChange={() => setExpandedPrompt(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-md border border-white/20 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{expandedPrompt?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {expandedPrompt?.context && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Context</h3>
                  <p className="text-gray-700">{expandedPrompt.context}</p>
                </div>
              )}
              {expandedPrompt?.role && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Role</h3>
                  <p className="text-gray-700">{expandedPrompt.role}</p>
                </div>
              )}
              {expandedPrompt?.interview && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Interview</h3>
                  <p className="text-gray-700">{expandedPrompt.interview}</p>
                </div>
              )}
              {expandedPrompt?.task && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Task</h3>
                  <p className="text-gray-700">{expandedPrompt.task}</p>
                </div>
              )}
              {expandedPrompt?.boundaries && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Boundaries</h3>
                  <p className="text-gray-700">{expandedPrompt.boundaries}</p>
                </div>
              )}
              {expandedPrompt?.reasoning && (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Reasoning</h3>
                  <p className="text-gray-700">{expandedPrompt.reasoning}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setExpandedPrompt(null)}
                  className="bg-white/50 hover:bg-white/70"
                >
                  Close
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    if (expandedPrompt) {
                      handleCopyPrompt(expandedPrompt);
                    }
                  }}
                >
                  Copy Prompt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Prompts; 