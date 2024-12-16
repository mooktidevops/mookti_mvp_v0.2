// app/admin/content-studio/modules/ChunkDetailModal.tsx
'use client';

import * as React from 'react';

import { Modal } from '@/components/custom/modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ContentChunk } from '@/lib/types/contentChunk';

import { getChunkTypeOptions, getNextActionOptions } from './ChunkForm.utils';

type Props = {
  chunk: ContentChunk;
  onClose: () => void;
  onEdit: (chunk: ContentChunk) => void;
  onDelete: (chunkId: string) => void;
};

export function ChunkDetailModal({ chunk, onClose, onEdit, onDelete }: Props) {
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  
  // Get display labels for type and nextAction
  const typeLabel = getChunkTypeOptions().find(opt => opt.value === chunk.type)?.label;
  const nextActionLabel = getNextActionOptions().find(opt => opt.value === chunk.nextAction)?.label;

  const handleDelete = () => {
    onDelete(chunk.id);
    setShowDeleteAlert(false);
    onClose();
  };

  return (
    <>
      <Modal onClose={onClose} title="Content Chunk Details" open={true}>
        <div className="grid gap-6">
          {chunk.title && (
            <div className="grid gap-2">
              <Label className="font-medium">Title</Label>
              <p className="text-sm">{chunk.title}</p>
            </div>
          )}

          {chunk.description && (
            <div className="grid gap-2">
              <Label className="font-medium">Description</Label>
              <p className="text-sm whitespace-pre-wrap">{chunk.description}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label className="font-medium">Type</Label>
            <p className="text-sm">{typeLabel}</p>
          </div>

          <div className="grid gap-2">
            <Label className="font-medium">Next Action</Label>
            <p className="text-sm">{nextActionLabel}</p>
          </div>

          <div className="grid gap-2">
            <Label className="font-medium">Content</Label>
            <div className="text-sm whitespace-pre-wrap border rounded-md p-4 bg-gray-50">
              {chunk.content}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="bg-black text-white hover:bg-black/90"
              onClick={() => onEdit(chunk)}
            >
              Edit
            </Button>
            <Button 
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setShowDeleteAlert(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this chunk?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep chunk</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              Delete chunk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}