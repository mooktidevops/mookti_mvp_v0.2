'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


import { LearningPathForm } from './LearningPathForm';

type LearningPath = {
  id: string;
  title: string;
  description?: string;
  slug: string;
};

export default function LearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    console.log('LearningPathsPage - Fetching learning paths');
    fetch('/admin/api/learning-paths')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('LearningPathsPage - Fetched learning paths:', data);
        setLearningPaths(data);
      })
      .catch(err => {
        console.error('LearningPathsPage - Error fetching learning paths:', err);
        alert('Failed to load learning paths.');
      });
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Learning Paths</h1>
        <Button onClick={() => setShowForm(true)}>Create New</Button>
      </div>
      <div className="grid gap-4">
        {learningPaths.map(lp => (
          <Card key={lp.id} className="p-4 hover:bg-muted cursor-pointer">
            <Link href={`/admin/content-studio/learning-paths/${lp.id}`}>
              <h2 className="text-lg font-semibold">{lp.title}</h2>
              <p>{lp.description}</p>
              <span className="text-sm text-muted-foreground">{lp.slug}</span>
            </Link>
          </Card>
        ))}
      </div>
      {showForm && (
        <LearningPathForm
          onClose={() => setShowForm(false)}
          onSuccess={(newLP) => {
            setLearningPaths(prev => [...prev, newLP]);
            alert('Learning path created successfully!');
          }}
        />
      )}
    </div>
  );
}