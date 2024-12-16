// app/(admin)/content-studio/learning-paths/LearningPathForm.tsx
'use client';

// import { desc } from 'drizzle-orm';

import { useState } from 'react';

import { Modal } from '@/components/custom/modal'; // replace with your modal
import { RichTextEditor } from '@/components/custom/rich-text-editor';
import { Button } from '@/components/ui/button';

type Props = {
  onClose: () => void;
  onSuccess: (lp: any) => void; 
};

export function LearningPathForm({ onClose, onSuccess }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
  
    const submit = async () => {
      if (!title || !slug) {
        console.log('Validation failed: Title and Slug are required');
        alert('Please fill in required fields');
        return;
      }
  
      setLoading(true);
      try {
        // Update the API endpoint to match our route structure
        const res = await fetch('/admin/api/learning-paths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, slug }),
        });
  
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error creating learning path:', errorText);
          throw new Error(errorText || 'Failed to create learning path');
        }
  
        const data = await res.json();
        console.log('Learning path created:', data);
        onSuccess(data);
        onClose();
      } catch (err) {
        console.error('Network error:', err);
        alert(err instanceof Error ? err.message : 'Failed to create learning path');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Modal open={true} onClose={onClose} title="Create Learning Path">
        <div className="grid gap-4">
          <div className="w-full">
            <RichTextEditor
              content={title}
              onChange={(newTitle) => setTitle(newTitle)}
              placeholder="Enter module title..."
            />
          </div>
          <div className="w-full">
            <RichTextEditor
              content={description}
              onChange={(newDesc) => setDescription(newDesc)}
              placeholder="Enter module description..."
            />
          </div>
          <div className="w-full">
            <RichTextEditor
              content={slug}
              onChange={(newSlug) => setSlug(newSlug)}
              placeholder="Enter module slug..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }