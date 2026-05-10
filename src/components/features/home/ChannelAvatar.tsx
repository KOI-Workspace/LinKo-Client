interface ChannelAvatarProps {
  name: string
  profileImageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  className?: string
}

/** 채널 이니셜/프로필 아바타 공통 UI */
export default function ChannelAvatar({
  name,
  profileImageUrl,
  size = 'md',
  selected = false,
  className = '',
}: ChannelAvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-16 h-16 text-base',
  }[size]

  return (
    <div
      className={`${sizeClass} rounded-full bg-primary-100 overflow-hidden flex items-center justify-center font-bold text-primary shrink-0 ${
        selected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${className}`}
    >
      {profileImageUrl ? (
        <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        name[0].toUpperCase()
      )}
    </div>
  )
}
