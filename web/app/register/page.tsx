import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Register - Nexus',
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <RegisterForm />
    </main>
  )
}
