'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('odCustomer');
    if (!stored) {
      router.push('/');
      return;
    }
    // Customer is logged in — go to policies page
    router.push('/policies');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f5f5', fontFamily: 'sans-serif'
    }}>
      <p style={{ color: '#888', fontSize: 14 }}>Loading...</p>
    </div>
  );
}
