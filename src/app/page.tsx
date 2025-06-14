export const dynamic = 'force-dynamic'

import { generateUserId } from '@/lib/userId'
import { redirect } from 'next/navigation'
import styles from './page.module.css'
import SignInButton from '@/components/auth/SignInButton'

export default async function SignInPage() {
  const userId = await generateUserId()

  async function handleSignIn() {
    'use server'
    // In a real application, you might want to store the user session in a database
    // or handle authentication differently on the server side
    // Redirect to the play page with userId as dynamic route parameter
    redirect(`/play/${userId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Sign In
            </h2>
            {userId && (
              <p className={styles.deviceInfo}>
                Device ID: {userId}...
              </p>
            )}
          </div>

          <div className={styles.form}>
            <form action={handleSignIn}>
              <div className={styles.inputGroup}>
                <SignInButton />
              </div>
            </form>

            <div className={styles.footer}>
              <p>Your device is automatically identified</p>
              <p>No passwords required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
