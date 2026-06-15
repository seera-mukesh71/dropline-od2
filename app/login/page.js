'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Page 2 — Login</h1>
      <p style={{ color: '#888', marginTop: 8 }}>Corporate Internet Banking login — coming next.</p>
      <button
        onClick={() => router.back()}
        style={{ marginTop: 24, padding: '10px 20px', cursor: 'pointer' }}
      >
        ← Back
      </button>
    </div>
  );
}