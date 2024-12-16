'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { rainbowColors } from '@/app/admin/content-studio/admin-styles';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ContentChunk } from '@/lib/types/contentChunk';

import { ChunkDetailModal } from '../ChunkDetailModal';
import { ChunkForm } from '../ChunkForm';

// Base interface for operations status
interface OperationsStatus {
  form: boolean;
  modal: boolean;
  dragDrop: boolean;
}

// Extended interface for UI metadata
interface ChunkWithMetadata extends ContentChunk {
  duration?: number;
  disabled?: boolean;
}

const RAINBOW_COLORS = [
  'bg-red-100',
  'bg-orange-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-purple-100',
] as const;

const CHUNK_TYPE_STYLES: Record<string, string> = {
  lesson: 'bg-blue-50 border-l-4 border-blue-400',
  quiz: 'bg-green-50 border-l-4 border-green-400',
  video: 'bg-yellow-50 border-l-4 border-yellow-400',
  default: 'bg-gray-50 border-l-4 border-gray-300',
} as const;

interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  slug: string;
}

interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  slug: string;
}

interface ModuleData {
  module: ModuleInfo;
  learningPaths: LearningPathItem[];
  chunks: ChunkWithMetadata[];
}

interface ChunkDragData {
  id: string;
  index: number;
  type: 'chunk';
}

export default function ModuleDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const moduleId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<ChunkWithMetadata | null>(null);
  const [showChunkForm, setShowChunkForm] = useState(false);
  const [editingChunk, setEditingChunk] = useState<ChunkWithMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const [operationsStatus, setOperationsStatus] = useState<OperationsStatus>({
    form: false,
    modal: false,
    dragDrop: false
  });

  const setOperationState = (operation: keyof OperationsStatus, isDisabled: boolean) => {
    console.log(`[setOperationState] Setting ${operation} to ${isDisabled}`);
    setOperationsStatus(prev => ({
      ...prev,
      [operation]: isDisabled
    }));
  };

  const fetchModuleData = useCallback(async () => {
    console.log('[fetchModuleData] Starting data fetch...');
    if (!moduleId) {
      console.error('[fetchModuleData] No module ID provided');
      setError('No module ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      console.log(`[fetchModuleData] Fetching data for moduleId: ${moduleId}`);
      const res = await fetch(`/admin/api/modules/${moduleId}`);

      console.log(`[fetchModuleData] Received response with status: ${res.status}`);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('[fetchModuleData] Non-OK response:', res.status, errorText);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      
      const data = await res.json().catch((jsonErr: any) => {
        console.error('[fetchModuleData] Failed to parse JSON:', jsonErr);
        throw new Error('Invalid JSON response');
      });

      console.log('[fetchModuleData] Data fetched successfully:', data);

      // Now data should represent a single module object with optional arrays.
      // Example expected structure:
      // {
      //   id: "...",
      //   title: "...",
      //   description: "...",
      //   slug: "...",
      //   learningPaths?: [...],
      //   chunks?: [...]
      // }
      if (!data.id) {
        console.error('[fetchModuleData] Invalid response format, no id present', data);
        throw new Error('Invalid response format');
      }

      setModuleData({
        module: {
          id: data.id,
          title: data.title || 'Untitled Module',
          description: data.description || '',
          slug: data.slug || '',
        },
        learningPaths: data.learningPaths || [],
        chunks: data.chunks || [],
      });
    } catch (err: any) {
      console.error('[fetchModuleData] Error loading module data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load module data');
    } finally {
      console.log('[fetchModuleData] Finished.');
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    console.log('[useEffect] Calling fetchModuleData');
    fetchModuleData();
  }, [fetchModuleData]);

  const handleChunkCreate = async (newChunk: ChunkWithMetadata) => {
    if (!moduleData || operationsStatus.form) {
      console.warn('[handleChunkCreate] Cannot create chunk: either no moduleData or form is disabled');
      return;
    }

    console.log('[handleChunkCreate] Creating a new chunk:', newChunk);
    setOperationState('form', true);
    setIsOperationInProgress(true);
    try {
      const res = await fetch(`/admin/api/content-chunks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChunk, moduleId }),
      });

      console.log('[handleChunkCreate] POST response status:', res.status);
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        console.error('[handleChunkCreate] Failed to create chunk:', errText);
        throw new Error(errText || 'Failed to create chunk');
      }

      const createdChunk = await res.json();
      console.log('[handleChunkCreate] Chunk created:', createdChunk);

      const updatedChunks = [...moduleData.chunks, createdChunk].map((chunk, index) => ({
        ...chunk,
        order: index + 1
      }));

      setModuleData({ 
        ...moduleData,
        chunks: updatedChunks
      });
      setShowChunkForm(false);
      toast({
        title: "Success",
        description: "Chunk created successfully.",
      });
    } catch (err: any) {
      console.error('[handleChunkCreate] Error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create chunk',
        variant: "destructive",
      });
    } finally {
      setOperationState('form', false);
      setIsOperationInProgress(false);
    }
  };

  const handleChunkDelete = async (chunkId: string) => {
    if (operationsStatus.modal) {
      console.warn('[handleChunkDelete] Modal operation disabled, cannot delete chunk:', chunkId);
      return;
    }

    console.log('[handleChunkDelete] Deleting chunk:', chunkId);
    setOperationState('modal', true);
    setIsOperationInProgress(true);
    try {
      const res = await fetch(`/admin/api/content-chunks/${chunkId}`, {
        method: 'DELETE',
      });
      console.log('[handleChunkDelete] DELETE response status:', res.status);

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        console.error('[handleChunkDelete] Failed to delete chunk:', errText);
        throw new Error(errText || 'Failed to delete chunk');
      }

      if (moduleData) {
        setModuleData({
          ...moduleData,
          chunks: moduleData.chunks.filter(chunk => chunk.id !== chunkId)
        });
      }

      setSelectedChunk(null);
      toast({
        title: "Success",
        description: "Chunk deleted successfully.",
      });
    } catch (err: any) {
      console.error('[handleChunkDelete] Error deleting chunk:', err);
      toast({
        title: "Error",
        description: "Failed to delete chunk. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOperationState('modal', false);
      setIsOperationInProgress(false);
    }
  };

  const handleChunkEdit = (chunk: ChunkWithMetadata) => {
    console.log('[handleChunkEdit] Editing chunk:', chunk.id);
    setEditingChunk(chunk);
    setSelectedChunk(null);
  };

  const handleChunkUpdate = async (updatedChunk: ChunkWithMetadata) => {
    if (!moduleData || operationsStatus.form) {
      console.warn('[handleChunkUpdate] Cannot update chunk, no moduleData or form disabled:', updatedChunk);
      return;
    }

    console.log('[handleChunkUpdate] Updating chunk:', updatedChunk.id);
    setOperationState('form', true);
    setIsOperationInProgress(true);
    try {
      const res = await fetch(`/admin/api/content-chunks/${updatedChunk.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedChunk),
      });
      console.log('[handleChunkUpdate] PATCH response status:', res.status);

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        console.error('[handleChunkUpdate] Failed to update chunk:', errText);
        throw new Error(errText || 'Failed to update chunk');
      }

      const updatedChunks = moduleData.chunks.map(chunk => 
        chunk.id === updatedChunk.id ? updatedChunk : chunk
      );

      setModuleData({
        ...moduleData,
        chunks: updatedChunks
      });

      setEditingChunk(null);
      toast({
        title: "Success",
        description: "Chunk updated successfully.",
      });
    } catch (err: any) {
      console.error('[handleChunkUpdate] Error:', err);
      toast({
        title: "Error",
        description: "Failed to update chunk. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOperationState('form', false);
      setIsOperationInProgress(false);
    }
  };

  useEffect(() => {
    console.log('[useEffect - DragAndDrop] Initializing drag and drop...');
    if (!moduleData?.chunks) {
      console.warn('[useEffect - DragAndDrop] No chunks in moduleData, skipping drag/drop setup.');
      return;
    }
    if (operationsStatus.dragDrop) {
      console.warn('[useEffect - DragAndDrop] dragDrop operation is in progress, skipping setup.');
      return;
    }

    const cleanupFns: Array<() => void> = [];
    const container = document.getElementById('chunks-container');
    if (!container) {
      console.warn('[useEffect - DragAndDrop] No container element found with id "chunks-container"');
      return;
    }

    moduleData.chunks.forEach((chunk, index) => {
      const element = document.getElementById(`chunk-${chunk.id}`);
      if (!element) {
        console.warn('[useEffect - DragAndDrop] No element found for chunk:', chunk.id);
        return;
      }

      const cleanup = draggable({
        element,
        dragHandle: element,
        getInitialData: (_args: unknown): Record<string, unknown> => ({
          id: chunk.id,
          index,
          type: 'chunk',
        }),
        onDragStart: () => {
          console.log('[DragAndDrop] onDragStart for chunk:', chunk.id);
          element.classList.add('opacity-50', 'shadow-lg');
        },
        onDrop: () => {
          console.log('[DragAndDrop] onDrop for chunk:', chunk.id);
          element.classList.remove('opacity-50', 'shadow-lg');
        },
      });
      cleanupFns.push(cleanup);
    });

    const dropCleanup = dropTargetForElements({
      element: container,
      getData: ({ element }) => ({
        index: Array.from(container.children).indexOf(element),
      }),
      onDragEnter: ({ location }) => {
        console.log('[DragAndDrop] onDragEnter at index:', location.current.dropTargets[0]?.data?.index);
        location.current.dropTargets[0]?.element.classList.add('border-2', 'border-blue-400');
      },
      onDragLeave: ({ location }) => {
        console.log('[DragAndDrop] onDragLeave at index:', location.current.dropTargets[0]?.data?.index);
        location.current.dropTargets[0]?.element.classList.remove('border-2', 'border-blue-400');
      },
      onDrop: async ({ location, source }) => {
        console.log('[DragAndDrop] onDrop event: source, destination', source.data, location.current.dropTargets[0]?.data);
        const sourceData = source.data as unknown as ChunkDragData;
        const destinationIndex = location.current.dropTargets[0]?.data?.index;

        if (typeof sourceData.index !== 'number' || typeof destinationIndex !== 'number') {
          console.error('Invalid drag/drop indices', { sourceData, destinationIndex });
          return;
        }

        try {
          setOperationState('dragDrop', true);
          setIsOperationInProgress(true);
          const updatedChunks = Array.from(moduleData.chunks);
          const [moved] = updatedChunks.splice(sourceData.index, 1);
          updatedChunks.splice(destinationIndex, 0, moved);

          const reorderedChunks = updatedChunks.map((c, idx) => ({
            ...c,
            order: idx + 1
          }));

          setModuleData({
            ...moduleData,
            chunks: reorderedChunks
          });

          console.log('[DragAndDrop] Sending reorder request to server:', reorderedChunks.map(c => c.id));
          const res = await fetch(`/admin/api/modules/${moduleId}/chunks/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chunks: reorderedChunks.map(c => c.id) }),
          });

          console.log('[DragAndDrop] PATCH response status:', res.status);
          if (!res.ok) {
            const errText = await res.text().catch(() => 'Unknown error');
            console.error('[DragAndDrop] Failed to reorder chunks:', errText);
            throw new Error(errText || 'Failed to reorder chunks');
          }
        } catch (err: any) {
          console.error('[DragAndDrop] Error reordering chunks:', err);
          toast({
            title: "Error",
            description: "Failed to reorder chunks. Please try again.",
            variant: "destructive",
          });
          // Revert to old state if needed
          setModuleData({
            ...moduleData,
            chunks: moduleData.chunks
          });
        } finally {
          setOperationState('dragDrop', false);
          setIsOperationInProgress(false);
        }
      },
    });
    cleanupFns.push(dropCleanup);

    return () => {
      console.log('[useEffect - DragAndDrop] Cleaning up drag and drop...');
      cleanupFns.forEach(fn => fn());
    };
  }, [moduleData, moduleId, toast, operationsStatus.dragDrop]);

  if (isLoading) {
    console.log('[Render] isLoading is true, rendering loader');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error('[Render] error encountered:', error);
    return (
      <div className="p-4">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg">{error}</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!moduleData) {
    console.warn('[Render] No moduleData found, rendering "No Module Found" state');
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>No Module Found</CardTitle>
            <CardDescription>
              The requested module could not be found.
              <Link href="/admin/content-studio" className="text-blue-600 hover:underline ml-2">
                Return to Content Studio
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { module, learningPaths, chunks } = moduleData;
  console.log('[Render] Rendering module detail page for:', module.id);

  return (
    <div className="p-4 grid gap-6">
      <Card className="p-4">
        <h1 className="text-2xl font-bold">{module.title}</h1>
        {module.description && (
          <p className="mt-2 text-gray-600">{module.description}</p>
      )}

      {learningPaths.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Included in Learning Paths</h2>
          <div className="flex flex-wrap gap-2">
           {learningPaths.map((lp, idx) => (
              <Button
                key={lp.id}
                asChild
                className={`px-3 py-1 text-sm rounded-md text-black hover:opacity-90 transition-colors ${
                  rainbowColors[idx % rainbowColors.length]
                }`}
              >
                <Link href={`/admin/content-studio/learning-paths/${lp.id}`}>
                  {lp.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        )}
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chunks</h2>
        <Button
          onClick={() => {
            console.log('[Render] "Add Chunk" button clicked');
            setShowChunkForm(true);
          }}
          disabled={operationsStatus.form || isOperationInProgress}
        >
          {isOperationInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Add Chunk'
          )}
        </Button>
      </div>

      <div
        id="chunks-container"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        {chunks.length > 0 ? (
          chunks.map((chunk: ChunkWithMetadata) => {
            const styleClass = CHUNK_TYPE_STYLES[chunk.type] ?? CHUNK_TYPE_STYLES.default;
            return (
              <Card
                key={chunk.id}
                id={`chunk-${chunk.id}`}
                className={`p-4 bg-white transition-all cursor-move hover:shadow-md ${styleClass}`}
                onClick={() => {
                  if (!operationsStatus.modal && !isOperationInProgress) {
                    console.log('[Render] Chunk clicked:', chunk.id);
                    setSelectedChunk(chunk);
                  } else {
                    console.log('[Render] Chunk click ignored: modal or operation in progress');
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {chunk.title || chunk.type}
                  </CardTitle>
                  {chunk.description && (
                    <CardDescription className="line-clamp-2">
                      {chunk.description}
                    </CardDescription>
                  )}
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="capitalize">{chunk.type}</span>
                    {chunk.duration && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{chunk.duration} min</span>
                      </>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full p-6">
            <CardHeader>
              <CardTitle className="text-center text-gray-500">No Chunks Found</CardTitle>
              <CardDescription className="text-center">
                Click &quot;Add Chunk&quot; to create your first content chunk for this module.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {showChunkForm && (
        <ChunkForm
          moduleId={module.id}
          onClose={() => {
            if (!operationsStatus.form && !isOperationInProgress) {
              console.log('[Render] Closing chunk form');
              setShowChunkForm(false);
            } else {
              console.log('[Render] Form close ignored: form or operation in progress');
            }
          }}
          onSuccess={handleChunkCreate}
          disabled={operationsStatus.form || isOperationInProgress}
          defaultValues={{
            type: 'lesson',
            moduleId: module.id,
            order: (chunks.length || 0) + 1
          }}
        />
      )}

      {editingChunk && (
        <ChunkForm
          moduleId={module.id}
          chunk={editingChunk}
          onClose={() => {
            if (!operationsStatus.form && !isOperationInProgress) {
              console.log('[Render] Closing editing form for chunk:', editingChunk.id);
              setEditingChunk(null);
            } else {
              console.log('[Render] Edit form close ignored: form or operation in progress');
            }
          }}
          onSuccess={handleChunkUpdate}
          disabled={operationsStatus.form || isOperationInProgress}
        />
      )}

      {selectedChunk && (
        <ChunkDetailModal
          chunk={selectedChunk}
          onClose={() => {
            if (!operationsStatus.modal && !isOperationInProgress) {
              console.log('[Render] Closing chunk detail modal for chunk:', selectedChunk.id);
              setSelectedChunk(null);
            } else {
              console.log('[Render] Detail modal close ignored: modal or operation in progress');
            }
          }}
          onEdit={handleChunkEdit}
          onDelete={handleChunkDelete}
        />
      )}
    </div>
  );
}