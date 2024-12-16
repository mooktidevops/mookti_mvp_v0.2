import { useState, useEffect } from 'react';

import { Modal } from '@/components/custom/modal';
import { Button } from '@/components/ui/button';

type Props = {
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function MediaSelectorModal({ onClose, onSelect }: Props) {
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/media-assets')
      .then(res => res.json())
      .then(data => setMedia(data))
      .catch(err => {
        console.error('Error fetching media:', err);
        alert('Failed to load media for selection.');
      });
  }, []);

  return (
    <Modal title="Select Media" onClose={onClose} open={true}>
      <div className="grid gap-4">
        {media.map((m) => (
          <div key={m.id} className="flex items-center gap-2 p-2 border hover:bg-muted cursor-pointer"
            onClick={() => {
              onSelect(m.id);
              onClose();
            }}>
            {m.type === 'image' ? <img src={m.url} alt="" className="h-10 w-10 object-cover" /> : <span>Video</span>}
            <span>{m.altText || m.url}</span>
          </div>
        ))}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}