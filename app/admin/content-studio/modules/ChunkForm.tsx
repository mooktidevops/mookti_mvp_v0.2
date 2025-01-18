// ./components/forms/ChunkForm.tsx
'use client';

import * as React from 'react';

import { MediaSelectorModal } from '@/app/admin/media-library/MediaSelectorModal';
import { Modal } from '@/components/custom/modal';
import { RichTextEditor } from '@/components/custom/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { ContentChunk, ContentChunkNextAction, ContentChunkType } from '@/lib/types/contentChunk';
import { DisplayType } from '@/lib/types/displayType';

import { CardCarouselInput } from './CardCarouselInput';
import { getChunkTypeOptions, getNextActionOptions, getDisplayTypeOptions } from './ChunkForm.utils';

type Props = {
  module_id: string;
  chunk?: ContentChunk;
  onClose: () => void;
  onSuccess: (chunk: ContentChunk) => void;
  disabled?: boolean;
  defaultValues?: {
    type: ContentChunkType;
    module_id: string;
    sequence_order: number;
  };
};

export function ChunkForm({ module_id, chunk, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState(chunk?.title || '');
  const [description, setDescription] = React.useState(chunk?.description || '');
  const [type, setType] = React.useState<ContentChunkType>(chunk?.type || ContentChunkType.lesson);
  const [content, setContent] = React.useState(chunk?.content || '');
  const [nextAction, setNextAction] = React.useState<ContentChunkNextAction>(
    chunk?.nextAction || ContentChunkNextAction.getNext
  );
  const [displayType, setDisplayType] = React.useState<DisplayType>(
    chunk?.display_type || DisplayType.message
  );
  const [mediaAssetId, setMediaAssetId] = React.useState(chunk?.mediaAssetId || '');
  const [showMediaModal, setShowMediaModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const chunkTypeOptions = getChunkTypeOptions();
  const nextActionOptions = getNextActionOptions();
  const displayTypeOptions = getDisplayTypeOptions();

  const handleTypeChange = (value: string) => {
    setType(value as ContentChunkType);
  };

  const handleNextActionChange = (value: string) => {
    setNextAction(value as ContentChunkNextAction);
  };

  const handleDisplayTypeChange = (value: string) => {
    setDisplayType(value as DisplayType);
  };

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
          module_id,
          title: title.trim(),
          description: description.trim(),
          type,
          content: content.trim(),
          nextAction,
          display_type: displayType,
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
          <div className="text-sm font-medium">Title (optional)</div>
          <Input
            id="title"
            placeholder="Enter title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <div className="text-sm font-medium">Description (optional)</div>
          <RichTextEditor
            content={description}
            onChange={(newDescription) => setDescription(newDescription)}
            placeholder="Enter description..."
          />
        </div>

        {/* Chunk Type */}
        <div className="grid gap-2">
          <div className="text-sm font-medium">Chunk Type</div>
          <RadioGroup value={type} onValueChange={handleTypeChange}>
            {chunkTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Next Action */}
        <div className="grid gap-2">
          <div className="text-sm font-medium">Next Action</div>
          <RadioGroup value={nextAction} onValueChange={handleNextActionChange}>
            {nextActionOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Content */}
        <div className="grid gap-2">
          <div className="text-sm font-medium">Content</div>
          {displayType === DisplayType.card_carousel ? (
            <CardCarouselInput
              value={content}
              onChange={(newContent: string) => setContent(newContent)}
            />
          ) : (
            <RichTextEditor
              content={content}
              onChange={(newContent: string) => setContent(newContent)}
              placeholder="Enter content..."
            />
          )}
        </div>

        {/* Display Type */}
        <div className="grid gap-2">
          <div className="text-sm font-medium">Display Type</div>
          <RadioGroup value={displayType} onValueChange={handleDisplayTypeChange}>
            {displayTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Media (if applicable) */}
        {type === ContentChunkType.media && (
          <div className="grid gap-2">
            <div className="text-sm font-medium">Media</div>
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