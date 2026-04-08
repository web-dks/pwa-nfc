type StatusVariant = 'info' | 'success' | 'error' | 'warning'

const variantClass: Record<StatusVariant, string> = {
  info: 'status status--info',
  success: 'status status--success',
  error: 'status status--error',
  warning: 'status status--warning',
}

type Props = {
  message: string
  variant?: StatusVariant
}

export function StatusMessage({ message, variant = 'info' }: Props) {
  return (
    <div
      className={variantClass[variant]}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
