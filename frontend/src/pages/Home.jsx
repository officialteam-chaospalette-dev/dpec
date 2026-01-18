import React from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

export default function Home(){
  return (
    <PageTransition>
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '30px',
          animation: 'bounce 2s infinite'
        }}>
          🛍️
        </div>
        
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px',
          animation: 'fadeInUp 1s ease-out'
        }}>
          ようこそ！
        </h2>
        
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '40px',
          lineHeight: '1.6',
          animation: 'fadeInUp 1s ease-out 0.2s both'
        }}>
          最新のアニメーション技術を駆使した<br />
          モダンなECサイトテンプレートへようこそ！
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          animation: 'fadeInUp 1s ease-out 0.4s both'
        }}>
          <Link 
            to="/products" 
            style={{
              background: 'linear-gradient(135deg, #00b894, #00cec9)',
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0, 184, 148, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 184, 148, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 184, 148, 0.3)'
            }}
          >
            🛒 商品一覧を見る
          </Link>
          
          <Link 
            to="/consent" 
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}
          >
            📋 事前同意書
          </Link>
          
          <Link 
            to="/survey" 
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 87, 108, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.3)'
            }}
          >
            📝 認知スタイルアンケート
          </Link>
          
          <Link 
            to="/ui-builder" 
            style={{
              background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '15px 30px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(254, 202, 87, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(254, 202, 87, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(254, 202, 87, 0.3)'
            }}
          >
            🎨 UI再構成タスク
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PageTransition>
  )
}
