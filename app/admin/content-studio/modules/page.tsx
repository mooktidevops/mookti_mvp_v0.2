// app/admin/content-studio/modules/page.tsx
'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { ModuleForm } from './ModuleForm';

type Module = {
  id: string;
  title: string;
  description?: string;
  slug: string;
};

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    console.log('ModulesPage - Fetching modules');
    fetch('/admin/api/modules')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('ModulesPage - Fetched modules:', data);
        setModules(data);
      })
      .catch(err => {
        console.error('ModulesPage - Error fetching modules:', err);
        alert('Failed to load modules.');
      });
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Modules</h1>
        <Button onClick={() => setShowForm(true)}>Create New</Button>
      </div>
      {/* Grid layout for modules */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {modules.map(m => (
          <Card key={m.id} className="p-4 hover:bg-muted cursor-pointer">
            <a href={`/admin/content-studio/modules/${m.id}`}>
              <h2 className="text-lg font-semibold">{m.title}</h2>
              <p>{m.description}</p>
              <span className="text-sm text-muted-foreground">{m.slug}</span>
            </a>
          </Card>
        ))}
      </div>
      {showForm && (
        <ModuleForm
          onClose={() => setShowForm(false)}
          onSuccess={(newModule) => {
            setModules(prev => [...prev, newModule]);
            alert('Module created successfully!');
          }}
        />
      )}
    </div>
  );
}