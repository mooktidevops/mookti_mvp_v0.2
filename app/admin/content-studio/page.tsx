// app/(admin)/content-studio/page.tsx
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ContentStudioPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Content Studio</h1>
      <div className="flex gap-4">
        <Card className="p-4 flex-1">
          <h2 className="text-lg font-semibold">Learning Paths</h2>
          <p>Manage and organize learning paths.</p>
          <Link href="/admin/content-studio/learning-paths">
            <Button variant="default" className="mt-2">View Learning Paths</Button>
          </Link>
        </Card>

        <Card className="p-4 flex-1">
          <h2 className="text-lg font-semibold">Modules</h2>
          <p>Create and edit modules and their content chunks.</p>
          <Link href="/admin/content-studio/modules">
            <Button variant="default" className="mt-2">View Modules</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}