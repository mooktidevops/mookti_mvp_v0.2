import Image from 'next/image';
import { type User } from 'next-auth';

interface AvatarProps {
  user: User;
}

export function Avatar({ user }: AvatarProps) {
  return (
    <Image
      src={`https://avatar.vercel.sh/${user.email}`}
      alt={user.email ?? 'User Avatar'}
      width={24}
      height={24}
      className="rounded-full"
    />
  );
}