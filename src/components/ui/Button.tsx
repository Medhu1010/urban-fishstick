import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[rgb(var(--color-accent))] text-[rgb(var(--color-accent-contrast))] hover:brightness-110 focus-visible:brightness-110',
  secondary:
    'bg-[rgb(var(--color-surface-muted))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]'
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`reduced-motion-safe inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    />
  )
}
