'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type MediaAsset = {
  id: string;
  url: string;
  type: 'image' | 'video';
  altText?: string;
};

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/media-assets')
      .then(res => res.json())
      .then(data => setMedia(data))
      .catch(err => {
        console.error('Error fetching media assets:', err);
        alert('Failed to load media assets.');
      });
  }, []);

  const uploadMedia = async () => {
    if (!file) {
      alert('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media-assets', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        console.error('Error uploading media:', await res.text());
        alert('Failed to upload media');
        return;
      }
      const data = await res.json();
      setMedia(prev => [...prev, data]);
      alert('Media uploaded successfully!');
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error');
    }
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Media Library</h1>
      <div className="flex gap-2 items-center">
        <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <Button onClick={uploadMedia}>Upload</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {media.map(m => (
          <Card key={m.id} className="p-2">
            {m.type === 'image' ? (
              <img src={m.url} alt={m.altText || 'Media asset'} className="w-full h-auto" />
            ) : (
              <video src={m.url} controls className="w-full h-auto" />
            )}
            <p className="text-sm mt-2">{m.altText}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}