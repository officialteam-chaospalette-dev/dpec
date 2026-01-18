import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useLogging } from '../contexts/LoggingContext'
import PageTransition from '../components/PageTransition'
import FakeSocialProof from '../components/dark-patterns/FakeSocialProof'
import FakeScarcity from '../components/dark-patterns/FakeScarcity'
import Preselection from '../components/dark-patterns/Preselection'
import { usePattern } from '../contexts/PatternContext'
import '../styles/DarkPatternStyles.css'

export default function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, addToCart } = useCart()
  const { markPatternUsed } = useLogging()
  const { patternEnabled, setPatternEnabled } = usePattern()
  const [selectedOptions, setSelectedOptions] = useState({
    warranty: true,
    insurance: true,
    newsletter: true,
    premiumSupport: true
  })
  const [showTrickWordingModal, setShowTrickWordingModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)

  // Sneaking: 自動同梱（1回のみ）
  useEffect(() => {
    if (!patternEnabled) return
    const flag = localStorage.getItem('sneaking_added')
    const exists = items.some(i => i.id === 'sneak-acc')
    if (!flag && !exists) {
      const accessory = {
        id: 'sneak-acc',
        name: 'ケアセット（自動追加）',
        description: 'お手入れ用クロスと保護スプレーのセット',
        price: 1200,
        image: 'https://via.placeholder.com/300x200?text=Care+Set'
      }
      addToCart(accessory)
      localStorage.setItem('sneaking_added', '1')
      markPatternUsed('sneaking', 'cart')
    }
  }, [patternEnabled, items, addToCart, markPatternUsed])

  if (items.length === 0) {
    return (
      <PageTransition>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '30px',
            animation: 'bounce 2s infinite'
          }}>
            🛒
          </div>
          
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            カートが空です
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            お気に入りの商品をカートに追加してみましょう！
          </p>
          
          <Link 
            to="/products" 
            className="btn btn-primary"
            style={{
              fontSize: '18px',
              padding: '15px 30px'
            }}
          >
            🛍️ 商品一覧を見る
          </Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            🛒 ショッピングカート
          </h2>
          
          {/* Dark Pattern: Fake Social Proof - 言語思考型, 物体視覚思考型 */}
          {/* Creates social validation in cart to encourage purchase */}
          <FakeSocialProof patternEnabled={patternEnabled} location="cart" />
          
          {/* Dark Pattern: Fake Scarcity - 物体視覚思考型 */}
          {/* Creates urgency to complete purchase */}
          <FakeScarcity patternEnabled={patternEnabled} location="cart" />
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              合計: {totalItems}点
            </span>
            <button 
              onClick={clearCart}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              カートを空にする
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="card"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '25px'
              }}
            >
              {/* 商品画像 */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '15px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* 商品情報 */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  {item.name}
                  {item.id === 'sneak-acc' && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>(自動追加)</span>
                  )}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '0.9rem',
                  marginBottom: '15px',
                  lineHeight: '1.4'
                }}>
                  {item.description}
                </p>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ¥{item.price.toLocaleString()}
                </div>
              </div>

              {/* 数量調整 / Sneaking削除UI（目立たせない） */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '25px',
                  padding: '5px 15px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '5px',
                      borderRadius: '50%',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    −
                  </button>
                  <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: '30px',
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '5px',
                      borderRadius: '50%',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    +
                  </button>
                </div>

                {/* 削除ボタン（sneakingは控えめな削除導線 + Trick wording） */}
                <button
                  onClick={() => {
                    if (item.id === 'sneak-acc' && patternEnabled) {
                      // Trick wording + Confirmshaming: 削除を確認するモーダルを表示
                      setItemToRemove(item.id)
                      setShowTrickWordingModal(true)
                      markPatternUsed('trick_wording', 'cart')
                      markPatternUsed('confirmshaming', 'cart')
                    } else {
                      removeFromCart(item.id)
                    }
                  }}
                  style={{
                    background: item.id === 'sneak-acc' ? 'rgba(255, 255, 255, 0.15)' : 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    color: item.id === 'sneak-acc' ? '#333' : 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={item.id === 'sneak-acc' ? '削除' : '商品を削除'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    if (item.id !== 'sneak-acc') {
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 107, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  🗑️
                </button>
              </div>

              {/* 小計 */}
              <div style={{
                textAlign: 'right',
                minWidth: '120px'
              }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '5px'
                }}>
                  小計
                </div>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #00b894, #00cec9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ¥{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dark Pattern: Preselection - 空間視覚思考型 */}
        {/* Pre-selects additional services in cart */}
        <Preselection 
          patternEnabled={patternEnabled} 
          onSelectionChange={setSelectedOptions}
          location="cart"
        />
        
        {/* 合計とチェックアウト */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{
                fontSize: '1.5rem',
                color: 'white',
                marginBottom: '10px'
              }}>
                合計商品数: {totalItems}点
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ¥{totalPrice.toLocaleString()}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              <Link 
                to="/products"
                className="btn btn-secondary"
                style={{ fontSize: '16px', padding: '12px 24px' }}
              >
                ← 買い物を続ける
              </Link>
              <Link 
                to="/checkout"
                className="btn btn-primary"
                style={{ fontSize: '18px', padding: '15px 30px' }}
              >
                💳 レジに進む
              </Link>
            </div>
          </div>

          {/* お得情報 */}
          <div style={{
            background: 'linear-gradient(135deg, #00b894, #00cec9)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
              🎉 送料無料キャンペーン実施中！
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              5,000円以上のお買い物で送料無料になります
            </div>
          </div>
        </div>
      </div>

      {/* Trick Wording Modal for Sneaking item removal */}
      {showTrickWordingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>ケアセットを削除しますか？</h3>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              ケアセットを削除すると、<strong>商品の保護が不十分になる可能性があります</strong>。
              <br />
              また、<strong>お手入れが面倒になる可能性</strong>があります。
            </p>
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              background: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffc107',
              fontSize: '13px',
              color: '#856404'
            }}>
              💡 <strong>おすすめ</strong>：ケアセットを追加することで、商品を長く大切に使えます。
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTrickWordingModal(false)
                  setItemToRemove(null)
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                やっぱり不要です
              </button>
              <button
                onClick={() => {
                  if (itemToRemove) {
                    removeFromCart(itemToRemove)
                  }
                  setShowTrickWordingModal(false)
                  setItemToRemove(null)
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                リスクを理解して削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}

