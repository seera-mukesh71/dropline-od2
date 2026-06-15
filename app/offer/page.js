'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('odCustomer');
    if (!stored) { router.push('/'); return; }
    setCustomer(JSON.parse(stored));
  }, [router]);

  if (!customer) return null;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'#f5f5f5', fontFamily:'sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 48px',
                    textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', maxWidth:520 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', marginBottom:8 }}>
          Login Successful!
        </h2>
        <p style={{ color:'#555', fontSize:15, marginBottom:8 }}>
          Welcome, <strong>{customer.userId}</strong>
        </p>
        <div style={{ background:'#fff5f2', border:'2px solid #E84E20', borderRadius:12,
                      padding:'20px 24px', margin:'20px 0' }}>
          <p style={{ color:'#888', fontSize:12, marginBottom:4 }}>Your Pre-Approved OD Limit</p>
          <p style={{ color:'#E84E20', fontSize:36, fontWeight:900, margin:0 }}>
            ₹{customer.offerAmount?.toLocaleString('en-IN')}
          </p>
          <p style={{ color:'#555', fontSize:13, marginTop:4 }}>
            {customer.tier} Tier · {customer.interestRate}% p.a.
          </p>
        </div>
        <p style={{ color:'#888', fontSize:13 }}>Page 3 — Offer Details coming next.</p>
        <button
          onClick={() => { sessionStorage.clear(); router.push('/'); }}
          style={{ marginTop:20, padding:'10px 28px', background:'#f0f0f0',
                   border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}