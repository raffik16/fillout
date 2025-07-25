import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to Drinkjoy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Discover your perfect drink matches
          </p>
        </div>
        <SignIn 
          fallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}