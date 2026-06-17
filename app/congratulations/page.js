'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CongratulationsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    setCustomer(JSON.parse(s));
  }, [router]);

  if (!customer) return null;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'#f5f5f5', fontFamily:'sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 48px',
                    textAlign:'center', maxWidth:520, boxShadow:'0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:24, fontWeight:800, color:'#1a1a1a', marginBottom:8 }}>
          E-sign Complete!
        </h2>
        <p style={{ color:'#555', fontSize:15, marginBottom:20, lineHeight:1.6 }}>
          Your Dropline OD of{' '}
          <strong style={{ color:'#E84E20' }}>
            ₹{customer.finalAmount?.toLocaleString('en-IN')}
          </strong>{' '}
          has been successfully signed.
        </p>
        <p style={{ color:'#aaa', fontSize:13 }}>Page 6 — Congratulations page coming next.</p>
      </div>
    </div>
  );
}