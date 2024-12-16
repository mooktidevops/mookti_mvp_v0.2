// ./components/forms/ModuleForm.tsx
'use client';

import React, { useState } from 'react';

import { Modal } from '@/components/custom/modal';
import { RichTextEditor } from '@/components/custom/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

type ModuleFormProps = {
  module?: any;
  onClose: () => void;
  onSuccess: (m: any) => void;
};

export function ModuleForm({ module, onClose, onSuccess }: ModuleFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const method = module ? 'PUT' : 'POST';
      const url = module ? `/admin/api/modules/${module.id}` : `/admin/api/modules/create`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save module');
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Error saving module:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save module',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={module ? "Edit Module" : "Create Module"}
      open={true}
    >
      <div className="grid gap-6">
        {/* Title */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <div className="w-full">
            <RichTextEditor
              content={title}
              onChange={(newTitle) => setTitle(newTitle)}
              placeholder="Enter module title..."
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <div className="w-full">
            <RichTextEditor
              content={description}
              onChange={(newDesc) => setDescription(newDesc)}
              placeholder="Enter module description..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : (module ? "Save" : "Create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}