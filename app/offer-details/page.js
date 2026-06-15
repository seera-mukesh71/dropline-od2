'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferDetailsPage() {
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
                    textAlign:'center', maxWidth:480, boxShadow:'0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Policies Accepted!</h2>
        <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>
          Chosen amount: <strong>₹{customer.chosenAmount?.toLocaleString('en-IN')}</strong>
        </p>
        <p style={{ color:'#aaa', fontSize:13 }}>Page 4 — Offer Details coming next.</p>
      </div>
    </div>
  );
}