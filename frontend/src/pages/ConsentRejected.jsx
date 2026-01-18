import React from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

export default function ConsentRejected() {
  return (
    <PageTransition>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '40px',
          border: '2px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#f5576c',
            marginBottom: '20px'
          }}>
            実験への参加を見送られました
          </h2>
          <p style={{
            color: '#000',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            marginBottom: '30px'
          }}>
            本実験への参加は任意であり、同意しない場合でも不利益を受けることはありません。<br />
            ご検討いただき、ありがとうございました。
          </p>
          <Link
            to="/"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}


