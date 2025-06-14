'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/ui'

export default function SignInButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      loading={pending}
      disabled={pending}
    >
      Sign In
    </Button>
  )
} 