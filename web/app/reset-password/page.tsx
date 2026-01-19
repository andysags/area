import ResetFormClient from './ResetFormClient';

export default function ResetPasswordPage({ searchParams }: { searchParams?: { [key: string]: string | string[] } }) {
  const token = Array.isArray(searchParams?.token) ? searchParams?.token[0] : (searchParams?.token as string | undefined);
  const uid = Array.isArray(searchParams?.uid) ? searchParams?.uid[0] : (searchParams?.uid as string | undefined);
  return <ResetFormClient initialUid={uid} initialToken={token} />;
}
