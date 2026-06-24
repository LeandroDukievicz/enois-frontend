import type { ReactNode } from 'react';

interface BadgeProps {
  children?: ReactNode;
  text?: string;
  variant?: 'light' | 'dark';
}

const badgeStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  light: 'inline-flex h-10 items-center gap-[10px] rounded-full border border-[#DDD2FF] bg-white/45 px-[18px] text-[16px] font-semibold leading-none text-[#7C3AED] shadow-[0_2px_10px_rgba(124,58,237,0.04)] backdrop-blur',
  dark: 'inline-flex h-10 items-center gap-[10px] rounded-full border border-purple-500/30 bg-purple-600/20 px-[18px] text-[16px] font-semibold leading-none text-purple-200',
};

export const Badge = ({ children, text, variant = 'light' }: BadgeProps) => {
  const content = text ?? children;

  return (
    <div className={badgeStyles[variant]}>
      <span className="h-[10px] w-[10px] rounded-full bg-[#7C3AED]" aria-hidden="true" />
      <span>{content}</span>
    </div>
  );
};
