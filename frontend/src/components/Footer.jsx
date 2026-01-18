import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '40px',
      marginTop: '60px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '30px'
      }}>
        {/* 会社情報 */}
        <div>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🛍️ DPEC
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6',
            marginBottom: '15px'
          }}>
            最新のテクノロジーと美しいデザインで、<br />
            最高のショッピング体験をお届けします。
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            marginTop: '20px'
          }}>
            <a href="#" style={{
              color: 'white',
              fontSize: '24px',
              textDecoration: 'none',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📘
            </a>
            <a href="#" style={{
              color: 'white',
              fontSize: '24px',
              textDecoration: 'none',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🐦
            </a>
            <a href="#" style={{
              color: 'white',
              fontSize: '24px',
              textDecoration: 'none',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📷
            </a>
          </div>
        </div>

        {/* ショッピング */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            🛒 ショッピング
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0
          }}>
            {[
              { text: '商品一覧', to: '/products' },
              { text: '新商品', to: '/products?new=true' },
              { text: 'セール商品', to: '/products?sale=true' },
              { text: 'ランキング', to: '/products?ranking=true' }
            ].map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <Link 
                  to={item.to}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                >
                  <span>→</span> {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* サポート */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            🆘 サポート
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0
          }}>
            {[
              { text: 'お問い合わせ', to: '/contact' },
              { text: 'よくある質問', to: '/faq' },
              { text: '配送について', to: '/shipping' },
              { text: '返品・交換', to: '/returns' }
            ].map((item, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <Link 
                  to={item.to}
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                >
                  <span>→</span> {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ニュースレター */}
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            📧 ニュースレター
          </h4>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            最新の商品情報やお得なキャンペーンを<br />
            お届けします！
          </p>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <input
              type="email"
              placeholder="メールアドレス"
              style={{
                flex: '1',
                minWidth: '150px',
                padding: '12px 15px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button className="btn btn-primary" style={{
              padding: '12px 20px',
              fontSize: '14px'
            }}>
              登録
            </button>
          </div>
        </div>
      </div>

      {/* コピーライト */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px'
      }}>
        <p>
          © 2024 DPEC. All rights reserved. | 
          <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', margin: '0 10px' }}>
            プライバシーポリシー
          </Link>
          |
          <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', margin: '0 10px' }}>
            利用規約
          </Link>
        </p>
      </div>
    </footer>
  )
}

