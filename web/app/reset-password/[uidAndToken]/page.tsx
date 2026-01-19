import ResetFormClient from '../ResetFormClient';

export default function ResetPasswordKeyPage({ params }: { params: { uidAndToken: string } }) {
  const raw = params.uidAndToken || '';
  // split on first '-' to separate uid and token (token may contain dashes)
  const idx = raw.indexOf('-');
  let uid: string | undefined;
  let token: string | undefined;
  if (idx >= 0) {
    uid = raw.slice(0, idx);
    token = raw.slice(idx + 1);
  } else {
    // if no dash, pass the full segment as token
    token = raw;
  }

  return <ResetFormClient initialUid={uid} initialToken={token} />;
}
