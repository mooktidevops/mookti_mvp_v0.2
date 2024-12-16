// ./components/forms/ChunkForm.tsx
'use client';

import { useState } from 'react';

import { MediaSelectorModal } from '@/app/admin/media-library/MediaSelectorModal';
import { Modal } from '@/components/custom/modal';
import { RichTextEditor } from '@/components/custom/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { ContentChunkNextAction, ContentChunkType } from '@/lib/types/contentChunk';

import { getChunkTypeOptions, getNextActionOptions } from './ChunkForm.utils';



type Props = {
  moduleId: string;
  chunk?: any;
  onClose: () => void;
  onSuccess: (c: any) => void;
  disabled?: boolean;
  defaultValues?: {
    type: string;
    moduleId: string;
    order: number;
  };
};

export function ChunkForm({ moduleId, chunk, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState(chunk?.title || '');
  const [description, setDescription] = useState(chunk?.description || '');
  const [type, setType] = useState<ContentChunkType>(chunk?.type || ContentChunkType.lesson);
  const [content, setContent] = useState(chunk?.content || '');
  const [nextAction, setNextAction] = useState<ContentChunkNextAction>(
    chunk?.nextAction || ContentChunkNextAction.getNext
  );
  const [mediaAssetId, setMediaAssetId] = useState(chunk?.mediaAssetId || '');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const chunkTypeOptions = getChunkTypeOptions();
  const nextActionOptions = getNextActionOptions();

  const submit = async () => {
    if (!type || !content) {
      toast({
        title: 'Validation Error',
        description: 'Type and Content are required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const method = chunk ? 'PUT' : 'POST';
      const url = chunk
        ? `/admin/api/content-chunks/${chunk.id}`
        : `/admin/api/content-chunks`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          title: title.trim(),
          description: description.trim(),
          type,
          content: content.trim(),
          nextAction,
          mediaAssetId: mediaAssetId || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save content chunk');
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Error saving chunk:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save chunk',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title={chunk ? 'Edit Content Chunk' : 'Create Content Chunk'} open={true}>
      <div className="grid gap-6">
        {/* Title */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <RichTextEditor
            content={description}
            onChange={(newDescription) => setDescription(newDescription)}
            placeholder="Enter description..."
          />
        </div>

        {/* Chunk Type */}
        <div className="grid gap-2">
          <Label>Chunk Type</Label>
          <RadioGroup
            value={type}
            onValueChange={(value: ContentChunkType) => setType(value)}
            className="grid grid-cols-2 gap-2"
          >
            {chunkTypeOptions.map((chunkType) => (
              <div key={chunkType.value}>
                <RadioGroupItem value={chunkType.value} id={chunkType.value} className="peer sr-only" />
                <Label
                  htmlFor={chunkType.value}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  {chunkType.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Next Action */}
        <div className="grid gap-2">
          <Label>Next Action</Label>
          <RadioGroup
            value={nextAction}
            onValueChange={(value: ContentChunkNextAction) => setNextAction(value)}
            className="grid grid-cols-2 gap-2"
          >
            {nextActionOptions.map((action) => (
              <div key={action.value}>
                <RadioGroupItem value={action.value} id={action.value} className="peer sr-only" />
                <Label
                  htmlFor={action.value}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  {action.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Content */}
        <div className="grid gap-2">
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            content={content}
            onChange={(newContent: string) => setContent(newContent)}
            placeholder="Enter content..."
          />
        </div>

        {/* Media (if applicable) */}
        {(type === ContentChunkType.image || type === ContentChunkType.video) && (
          <div className="grid gap-2">
            <Label>Media</Label>
            <Button variant="outline" onClick={() => setShowMediaModal(true)}>
              {mediaAssetId ? 'Change Media' : 'Select Media'}
            </Button>
          </div>
        )}

        {showMediaModal && (
          <MediaSelectorModal
            onClose={() => setShowMediaModal(false)}
            onSelect={(assetId: string) => {
              setMediaAssetId(assetId);
              setShowMediaModal(false);
            }}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : chunk ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}