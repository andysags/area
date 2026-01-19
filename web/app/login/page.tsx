import LoginForm from './LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login - Nexus'
};

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#0f1724] text-zinc-100">
      <LoginForm />
    </main>
  );
}
