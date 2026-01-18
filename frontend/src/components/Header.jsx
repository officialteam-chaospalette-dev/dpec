import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function Header() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <header className="header">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* ロゴ */}
        <Link 
          to="/" 
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{
            fontSize: '2.5rem',
            animation: 'bounce 2s infinite'
          }}>
            🛍️
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            DPEC
          </h1>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="nav" style={{ display: isMenuOpen ? 'flex' : 'flex' }}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            🏠 ホーム
          </Link>
          <Link 
            to="/products" 
            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            🛒 商品一覧
          </Link>
          <Link 
            to="/cart" 
            className="nav-link"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative'
            }}
          >
            🛒 カート
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                animation: 'pulse 2s infinite'
              }}>
                {totalItems}
              </span>
            )}
          </Link>
        </nav>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '10px',
            color: 'white',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
          className="mobile-menu-btn"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* 検索バー */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          maxWidth: '500px'
        }}>
          <input
            type="text"
            placeholder="商品を検索..."
            style={{
              width: '100%',
              padding: '15px 20px 15px 50px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '18px'
          }}>
            🔍
          </div>
        </div>
        <button className="btn btn-primary">
          検索
        </button>
      </div>

      {/* お知らせバナー */}
      <div style={{
        marginTop: '20px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '15px',
        padding: '15px',
        textAlign: 'center',
        color: 'white',
        animation: 'pulse 3s infinite'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          🎉 新商品入荷！今だけ送料無料キャンペーン実施中 🎉
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav {
            display: ${isMenuOpen ? 'flex' : 'none'} !important;
            flex-direction: column;
            width: 100%;
            margin-top: 20px;
            gap: 10px;
          }
          
          .nav-link {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </header>
  )
}
