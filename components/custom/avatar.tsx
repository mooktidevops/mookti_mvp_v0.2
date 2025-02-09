import Image from 'next/image';
import { type User } from 'next-auth';

interface AvatarProps {
  user?: User;
}

export function Avatar({ user }: AvatarProps) {
  const email = user?.email || 'default@example.com';
  return (
    <Image
      src={`https://avatar.vercel.sh/${email}`}
      alt={user?.email || 'User Avatar'}
      width={24}
      height={24}
      className="rounded-full"
    />
  );
}