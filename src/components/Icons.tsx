import type { SVGProps } from 'react'

// Ícones desenhados no mesmo traço: 24px, stroke 2, pontas retas (combina com os cantos retos).
type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const CartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 3h3l2.6 12.2h11.2L21 7H6.2" />
    <path d="M9 20.5h.01M18 20.5h.01" strokeWidth="3" />
  </Base>
)

export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </Base>
)

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5h18v14H3z" />
    <path d="m3 6 9 7 9-7" />
  </Base>
)

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 11h14v10H5z" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <path d="M12 15v2" />
  </Base>
)

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Base>
)

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 5-7 7 7 7" />
  </Base>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 5 7 7-7 7" />
  </Base>
)

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 9 7 7 7-7" />
  </Base>
)

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </Base>
)

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path d="M12 7v5l3 2" />
  </Base>
)

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Base>
)

export const LogoutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
  </Base>
)

/** Estrela da avaliação: passe fill="currentColor" para a cheia. */
export const StarIcon = (p: IconProps) => (
  <Base strokeLinejoin="round" {...p}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />
  </Base>
)

export const RetryIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Base>
)
