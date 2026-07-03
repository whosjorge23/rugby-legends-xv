import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
  }
>

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => (
  <button className={`button button-${variant} ${className}`} {...props}>
    {children}
  </button>
)
