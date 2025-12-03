import { SignIn } from '@clerk/clerk-react'
import { SplashCursor } from '@/components/ui/splash-cursor'

export function SignInPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SplashCursor />
      <div
        className="absolute inset-0 bg-gradient-to-br from-violet-100/30 via-indigo-50/30 to-rose-100/30 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(135deg, oklch(0.92 0.05 290 / 0.3) 0%, oklch(0.95 0.03 260 / 0.3) 50%, oklch(0.93 0.04 25 / 0.3) 100%)'
        }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome to Ronen's Chatbot Demo
            </h1>
            <p className="text-muted-foreground">
              Sign in with email or your Microsoft account to continue
            </p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-2xl backdrop-blur-xl bg-card/70 border-white/20',
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  )
}
