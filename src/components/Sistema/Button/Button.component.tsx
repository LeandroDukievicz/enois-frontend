import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondarySoft' | 'outlineDark' | 'outlineWhite' | 'white' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'nav' | 'hero';
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[#7C3AED] text-white shadow-[0_14px_28px_rgba(124,58,237,0.22)] hover:bg-[#6D28D9]',
  secondarySoft: 'border border-[#E5E0EB] bg-white text-[#352451] shadow-[0_8px_18px_rgba(52,36,81,0.05)] hover:border-[#7C3AED] hover:text-[#7C3AED]',
  outlineDark: 'border border-[#374151] bg-transparent text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED]',
  outlineWhite: 'border border-white bg-transparent text-white hover:bg-white/10',
  white: 'bg-white text-[#7C3AED] hover:bg-neutral-50',
  ghost: 'bg-transparent text-[#7C3AED] hover:bg-purple-50',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'min-h-11 px-6 text-[15px]',
  sm: 'min-h-9 px-4 text-sm',
  lg: 'min-h-[52px] px-7 text-base',
  nav: 'h-[49px] min-w-[156px] px-7 text-[17px]',
  hero: 'h-[58px] min-w-[250px] px-9 text-[20px]',
};

export const Button = ({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-medium leading-none transition duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
