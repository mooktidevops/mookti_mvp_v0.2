'use client';

import { useRouter } from 'next/navigation';
import { type User } from 'next-auth';
import { useSession } from 'next-auth/react';

import { PlusIcon } from '@/components/custom/icons';
import { SidebarHistory } from '@/components/custom/sidebar-history';
import { SidebarUserNav } from '@/components/custom/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

export function AppSidebar({ user }: { user?: User }) {
  const { data: session } = useSession();
  const currentUser = user ?? (session?.user as User);
  const router = useRouter();

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Header: Chat History label and New Chat button */}
        <div className="flex items-center justify-between">
          <span
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
            className="text-lg font-semibold text-gray-900 cursor-pointer"
          >
            Chat History
          </span>
          <BetterTooltip content="New Chat" align="start">
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon size={20} />
            </Button>
          </BetterTooltip>
        </div>
        {/* Chat History Content */}
        <div>
          <SidebarHistory user={currentUser} showLoginPrompt={!currentUser} />
        </div>
      </div>
      {/* User Navigation (if user exists) */}
      {currentUser && (
        <div>
          <SidebarUserNav user={currentUser} />
        </div>
      )}
    </div>
  );
}