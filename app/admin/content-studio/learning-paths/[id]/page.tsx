// app/admin/content-studio/learning-paths/[id]/page.tsx
'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { ModuleSelector } from './ModuleSelector';

type LearningPathModule = {
  id: string;
  title?: string;
  description?: string;
  order: number;
};

type LearningPathData = {
  id: string;
  title?: string;
  description?: string;
  slug?: string;
  modules: LearningPathModule[];
};

// Type for the drag data
type ModuleDragData = {
  id: string;
  index: number;
};

export default function LearningPathDetailPage() {
  const params = useParams();
  const learningPathId = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  useEffect(() => {
    if (!learningPathId) {
      setError('No learning path ID provided');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch learning path details
        const pathRes = await fetch(`/admin/api/learning-paths/${learningPathId}`);
        if (!pathRes.ok) {
          throw new Error(`HTTP error! status: ${pathRes.status}`);
        }
        const pathData = await pathRes.json();

        // Fetch associated modules
        const modulesRes = await fetch(`/admin/api/learning-path-modules?learningPathId=${learningPathId}`);
        if (!modulesRes.ok) {
          throw new Error(`HTTP error! status: ${modulesRes.status}`);
        }
        const modulesData = await modulesRes.json();

        // Combine the data
        setLearningPath({
          ...pathData,
          modules: modulesData.map((module: any, index: number) => ({
            ...module,
            order: index + 1,
          })),
        });
      } catch (err) {
        console.error('Error fetching learning path detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load learning path details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [learningPathId]);

  useEffect(() => {
    if (!learningPath || !learningPath.modules) return;

    const cleanupFns: Array<() => void> = [];

    // Setup draggable elements
    learningPath.modules.forEach((module, index) => {
      const element = document.getElementById(`module-${module.id}`);
      if (!element) return;

      const cleanup = draggable({
        element,
        dragHandle: element,
        getInitialData: (): ModuleDragData => ({
          id: module.id,
          index,
        }),
      });
      cleanupFns.push(cleanup);
    });

    // Setup drop zone
    const dropZone = document.getElementById('modules-container');
    if (dropZone) {
      const dropCleanup = dropTargetForElements({
        element: dropZone,
        getData: ({ element }): Record<string, unknown> => {
          const container = document.getElementById('modules-container');
          if (!container) return {};
          
          const items = Array.from(container.children);
          const index = items.indexOf(element);
          return { index };
        },
        onDrop: async ({ 
          location: { 
            initial: { dropTargets: initialDropTargets },
            current: { dropTargets: currentDropTargets }
          },
          source 
        }) => {
          if (!learningPath) return;

          const sourceData = source.data as ModuleDragData;
          const destinationIndex = currentDropTargets[0]?.data.index as number;

          if (typeof sourceData.index !== 'number' || typeof destinationIndex !== 'number') {
            console.error('Invalid drag and drop data');
            return;
          }

          const updatedModules = Array.from(learningPath.modules);
          const [moved] = updatedModules.splice(sourceData.index, 1);
          updatedModules.splice(destinationIndex, 0, moved);

          const reorderedModules = updatedModules.map((m, idx) => ({
            ...m,
            order: idx + 1,
          }));

          // Optimistic update
          setLearningPath({ ...learningPath, modules: reorderedModules });

          try {
            const res = await fetch(`/api/learning-paths/${learningPathId}/reorder-modules`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                modules: reorderedModules.map(m => m.id)
              }),
            });

            if (!res.ok) {
              throw new Error(await res.text() || 'Failed to reorder modules');
            }
          } catch (err) {
            // Revert on error
            setLearningPath({ ...learningPath, modules: learningPath.modules });
            console.error('Error reordering modules:', err);
            alert('Failed to reorder modules. Please try again.');
          }
        },
      });
      cleanupFns.push(dropCleanup);
    }

    return () => cleanupFns.forEach(fn => fn());
  }, [learningPath, learningPathId]);

  const handleAddModule = async (moduleId: string) => {
    try {
      // First add the module to the learning path
      const res = await fetch('/admin/api/learning-path-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningPathId,
          moduleId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add module to learning path');
      }

      // Now fetch both the learning path and its modules to ensure we have fresh data
      const [pathRes, modulesRes] = await Promise.all([
        fetch(`/admin/api/learning-paths/${learningPathId}`),
        fetch(`/admin/api/learning-path-modules?learningPathId=${learningPathId}`)
      ]);

      if (!pathRes.ok || !modulesRes.ok) {
        throw new Error('Failed to fetch updated data');
      }

      const [pathData, modulesData] = await Promise.all([
        pathRes.json(),
        modulesRes.json()
      ]);

      // Update the learning path state with fresh data
      setLearningPath({
        ...pathData,
        modules: modulesData.map((module: any, index: number) => ({
          ...module,
          order: index + 1,
        })),
      });

      setShowModuleSelector(false);
    } catch (err) {
      console.error('Error adding module to learning path:', err);
      alert('Failed to add module to learning path');
    }
  };

  const handleModuleClick = (event: React.MouseEvent) => {
    // If the user is dragging, prevent navigation
    if (event.currentTarget.classList.contains('dragging')) {
      event.preventDefault();
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!learningPath) {
    return <div className="p-4">No learning path found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{learningPath.title ?? 'Untitled Learning Path'}</h1>
      {learningPath.description && <p className="mt-2">{learningPath.description}</p>}
      {learningPath.slug && (
        <span className="text-sm text-muted-foreground block mt-1">
          {learningPath.slug}
        </span>
      )}

      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">Modules in Learning Path</h2>
        <Button onClick={() => setShowModuleSelector(true)}>Add Module</Button>
      </div>
      
      <div id="modules-container" className="mt-4 space-y-2">
        {learningPath.modules && learningPath.modules.length > 0 ? (
          learningPath.modules.map((module) => (
            <Link
              key={module.id}
              href={`/admin/content-studio/modules/${module.id}`}
              onClick={handleModuleClick}
              className="block"
            >
              <Card
                id={`module-${module.id}`}
                className="p-4 bg-white transition-shadow cursor-move hover:shadow-md group"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{module.title ?? 'Untitled Module'}</CardTitle>
                      {module.description && <CardDescription>{module.description}</CardDescription>}
                    </div>
                    <span className="invisible group-hover:visible text-sm text-muted-foreground">
                      View Module →
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <p>No modules found for this learning path.</p>
        )}
      </div>

      {showModuleSelector && (
        <ModuleSelector
          onClose={() => setShowModuleSelector(false)}
          onModuleAdd={handleAddModule}
          learningPathId={learningPathId}
        />
      )}
    </div>
  );
}