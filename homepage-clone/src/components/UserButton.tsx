import { UserButton as ClerkUserButton } from '@clerk/clerk-react'

export function UserButton() {
  return (
    <div className="fixed top-4 right-32 z-[100]">
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox: 'w-10 h-10',
            userButtonPopoverCard: 'shadow-2xl',
          },
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  )
}
