'use client';
import { useRouter } from 'next/navigation';

export default function NotEligible() {
  const router = useRouter();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'#f5f5f5', fontFamily:'sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 48px',
                    textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', maxWidth:480 }}>
        <div style={{ fontSize:52, marginBottom:16 }}>😔</div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', marginBottom:8 }}>
          No Pre-Approved Offer
        </h2>
        <p style={{ color:'#666', fontSize:14, lineHeight:1.6, marginBottom:28 }}>
          Based on our evaluation, we are unable to offer a Dropline OD facility at this time.
          You may be eligible in the future as your account history grows.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{ padding:'12px 32px', background:'#E84E20', color:'#fff',
                   border:'none', borderRadius:30, fontSize:15, fontWeight:700,
                   cursor:'pointer' }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}