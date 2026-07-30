import Image from 'next/image';

interface ProfileHeaderProps {
  name: string;
  level: number;
  avatar?: string | null;
}

export default function ProfileHeader({ name, level, avatar }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
      <div className="relative">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={80}
            height={80}
            className="rounded-full border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-2xl font-bold text-gray-600">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm border-2 border-white shadow-md">
          {level}
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white">{name}</h1>
        <p className="text-blue-100">Level {level}</p>
      </div>
    </div>
  );
}
