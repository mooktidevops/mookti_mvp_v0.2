// app/admin/content-studio/learning-paths/[id]/ModuleSelector.tsx
'use client';

import { useState, useEffect } from 'react';

import { Modal } from '@/components/custom/modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Module = {
  id: string;
  title: string;
  description?: string;
  slug: string;
};

type Props = {
  onClose: () => void;
  onModuleAdd: (moduleId: string) => Promise<void>;
  learningPathId: string;
};

export function ModuleSelector({ onClose, onModuleAdd, learningPathId }: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    slug: '',
  });

  // Fetch existing modules
  useEffect(() => {
    fetch('/admin/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching modules:', err);
        setError('Failed to load modules');
        setLoading(false);
      });
  }, []);

  const handleCreateModule = async () => {
    try {
      const res = await fetch('/admin/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule),
      });

      if (!res.ok) throw new Error('Failed to create module');

      const createdModule = await res.json();
      setModules(prev => [...prev, createdModule]);
      setShowCreateForm(false);
      setNewModule({ title: '', description: '', slug: '' });
    } catch (err) {
      console.error('Error creating module:', err);
      alert('Failed to create module');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Modal open={true} onClose={onClose} title="Add Module to Learning Path">
      <div className="space-y-4">
        {showCreateForm ? (
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newModule.title}
              onChange={e => setNewModule(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={newModule.description}
              onChange={e => setNewModule(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              placeholder="Slug"
              value={newModule.slug}
              onChange={e => setNewModule(prev => ({ ...prev, slug: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule}>Create Module</Button>
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => setShowCreateForm(true)}>Create New Module</Button>
            <div className="grid gap-2">
              {modules.map(module => (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => onModuleAdd(module.id)}
                >
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    {module.description && (
                      <CardDescription>{module.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}