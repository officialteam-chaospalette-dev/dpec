import React, {useEffect, useState} from 'react'
import { PRODUCTS, getAvailableLowestPrice } from '../data/products'
import { Link, useSearchParams } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FakeSocialProof from '../components/dark-patterns/FakeSocialProof'
import FakeScarcity from '../components/dark-patterns/FakeScarcity'
import { usePattern } from '../contexts/PatternContext'
import { useLogging } from '../contexts/LoggingContext'
import '../styles/DarkPatternStyles.css'

function DisguisedAdCard({ onImpression }) {
  useEffect(() => {
    onImpression?.()
  }, [onImpression])
  return (
    <div className="product-card" style={{ position: 'relative', padding: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'white' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 12, color: '#888', border: '1px solid #ccc', borderRadius: 6, padding: '2px 6px', background: '#f9f9f9' }}>広告</div>
      <div style={{ height: 160, borderRadius: 8, background: 'linear-gradient(135deg,#f0f4ff,#fff2f2)', marginBottom: 12 }} />
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>おすすめ特集</div>
      <div style={{ fontSize: 13, color: '#666' }}>今ならポイントアップ中</div>
    </div>
  )
}

export default function ProductList(){
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // URLクエリパラメータから初期値を取得、なければデフォルト値
  const [sortOrder, setSortOrder] = useState(() => searchParams.get('sort') || 'new')
  const [filter, setFilter] = useState(() => searchParams.get('filter') || 'all')
  
  const { patternEnabled, setPatternEnabled, categoryFilter, patternIntensity, productIdRange } = usePattern()
  const { logFilterSort, logComparisonAction, markPatternUsed } = useLogging()
  
  // 正解商品を後ろに移動する関数（正解商品を左上に配置しないため）
  // 重度の場合は正解商品（206）を3番目に配置する
  const moveCorrectProductsToEnd = (products) => {
    const correctProductIds = [101, 201, 206, 209] // 正解商品（空気清浄機、掃除機、加湿器、電子レンジ）
    const correctProducts = []
    const otherProducts = []
    
    products.forEach(product => {
      if (correctProductIds.includes(product.id)) {
        correctProducts.push(product)
      } else {
        otherProducts.push(product)
      }
    })
    
    // 重度の場合は正解商品（206）を3番目に配置
    if (patternIntensity === 'high' && correctProducts.some(p => p.id === 206)) {
      const correctProduct206 = correctProducts.find(p => p.id === 206)
      const otherCorrectProducts = correctProducts.filter(p => p.id !== 206)
      // 他の商品を前2つに配置し、3番目に正解商品を配置
      if (otherProducts.length >= 2) {
        return [...otherProducts.slice(0, 2), correctProduct206, ...otherProducts.slice(2), ...otherCorrectProducts]
      } else {
        // 商品が2つ以下の場合は後ろに配置
        return [...otherProducts, correctProduct206, ...otherCorrectProducts]
      }
    }
    
    // それ以外の場合は正解商品を後ろに配置
    return [...otherProducts, ...correctProducts]
  }
  
  // URLクエリパラメータを更新する関数
  const updateSearchParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== 'all' && value !== 'new') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams, { replace: true })
  }

  // URLクエリパラメータの変更を監視して状態を同期（ブラウザの戻る/進むボタン対応）
  useEffect(() => {
    const urlSort = searchParams.get('sort') || 'new'
    const urlFilter = searchParams.get('filter') || 'all'
    if (urlSort !== sortOrder) {
      setSortOrder(urlSort)
    }
    if (urlFilter !== filter) {
      setFilter(urlFilter)
    }
  }, [searchParams])

  useEffect(()=>{
    setLoading(true)
    // フロントエンドで静的に管理された商品データを使用
    setTimeout(() => {
      const source = PRODUCTS
      let filtered = categoryFilter === 'all' ? source : source.filter(p => p.category === categoryFilter)
      
      // 強度レベルに応じた商品ID範囲でフィルタリング
      if (productIdRange) {
        if (patternIntensity === 'high') {
          // 重度の場合は204-206、214-217のみ（加湿器のみ）- 合計7商品
          // 210-211は電子レンジなので除外
          filtered = filtered.filter(p => (p.id >= 204 && p.id <= 206) || (p.id >= 214 && p.id <= 217))
        } else {
        filtered = filtered.filter(p => p.id >= productIdRange.min && p.id <= productIdRange.max)
        }
      }
      
      setProducts(filtered)
      
      // フィルター適用（カテゴリ別）
      let filteredByCategory = filtered
      if (filter !== 'all') {
        if (filter === 'electronics') {
          filteredByCategory = filtered.filter(p => p.category === 'electronics')
        } else if (filter === 'furniture') {
          filteredByCategory = filtered.filter(p => p.category === 'furniture')
        } else {
          // その他のフィルター（新商品、セール、人気）はランダムに一部を表示
          filteredByCategory = filtered.filter(() => Math.random() > 0.3)
        }
      }
      
      // 正解商品を後ろに移動（左上に配置しないため）
      filteredByCategory = moveCorrectProductsToEnd(filteredByCategory)
      
      // ソート順を適用
      if (sortOrder === 'new') {
        // 新着順はID順だが、正解商品は既に後ろに移動済み
        filteredByCategory.sort((a, b) => a.id - b.id)
      }
      
      setFilteredProducts(filteredByCategory)
      setLoading(false)
    }, 500)
  }, [categoryFilter, filter, patternIntensity, productIdRange])

  // Visual Interference: パターン有効時のみ記録（商品一覧での使用）
  useEffect(() => {
    if (patternEnabled && filteredProducts.length > 0) {
      const correctProductIds = [101, 201, 206, 209] // 正解商品（空気清浄機、掃除機、加湿器、電子レンジ）
      const wrongProductIds = [102, 103, 104, 105, 202, 203, 204, 205, 207, 208] // ハズレ商品
      const hasCorrectProduct = filteredProducts.some(p => correctProductIds.includes(p.id))
      const hasWrongProduct = filteredProducts.some(p => wrongProductIds.includes(p.id))
      if (hasCorrectProduct || hasWrongProduct) {
        markPatternUsed('visual_interference', 'product_list')
      }
    }
  }, [patternEnabled, filteredProducts, markPatternUsed])

  const handleAdImpression = () => {
    if (patternEnabled) {
      markPatternUsed('disguised_ads', 'product_list')
    }
  }

  // ソート変更を記録（不完全なソート機能 - 決定論的）
  const handleSortChange = (e) => {
    const newSortOrder = e.target.value
    setSortOrder(newSortOrder)
    updateSearchParams('sort', newSortOrder)
    logFilterSort('sort', newSortOrder)
    
    // ソートされた商品リストを作成（不完全な実装 - 決定論的）
    let sortedProducts = [...filteredProducts]
    switch(newSortOrder) {
      case 'price-low':
        // 不完全: 一部の商品が正しくソートされない（決定論的）
        sortedProducts.sort((a, b) => {
          const priceA = Math.min(...(a.skus?.map(s => s.price) || [a.price]))
          const priceB = Math.min(...(b.skus?.map(s => s.price) || [b.price]))
          // 商品IDの下1桁で判断（決定論的）
          // 10%程度の商品が逆順になる（IDの下1桁が2,5,8の商品とその次の商品を入れ替える）
          const idModA = a.id % 10
          const idModB = b.id % 10
          if ((idModA === 2 || idModA === 5 || idModA === 8) && Math.abs(priceA - priceB) < 2000) {
            // 価格差が小さい場合のみ入れ替え
            return priceB - priceA
          }
          return priceA - priceB
        })
        // 正解商品を後ろに移動（左上に配置しないため）
        sortedProducts = moveCorrectProductsToEnd(sortedProducts)
        break
      case 'price-high':
        // 不完全: 一部の商品が正しくソートされない（決定論的）
        sortedProducts.sort((a, b) => {
          const priceA = Math.min(...(a.skus?.map(s => s.price) || [a.price]))
          const priceB = Math.min(...(b.skus?.map(s => s.price) || [b.price]))
          // 商品IDの下1桁で判断（決定論的）
          // 15%程度の商品が逆順になる（IDの下1桁が3,6,9の商品とその次の商品を入れ替える）
          const idModA = a.id % 10
          const idModB = b.id % 10
          if ((idModA === 3 || idModA === 6 || idModA === 9) && Math.abs(priceA - priceB) < 3000) {
            // 価格差が小さい場合のみ入れ替え
            return priceA - priceB
          }
          return priceB - priceA
        })
        // 正解商品を後ろに移動（左上に配置しないため）
        sortedProducts = moveCorrectProductsToEnd(sortedProducts)
        break
      case 'popular':
        // 人気順は商品ID順（決定論的だが実際の人気度とは異なる）
        sortedProducts.sort((a, b) => {
          // IDの下2桁でソート（決定論的）
          return (a.id % 100) - (b.id % 100)
        })
        // 正解商品を後ろに移動（左上に配置しないため）
        sortedProducts = moveCorrectProductsToEnd(sortedProducts)
        break
      default:
        // 新着順はID順
        sortedProducts.sort((a, b) => a.id - b.id)
        // 正解商品を後ろに移動（左上に配置しないため）
        sortedProducts = moveCorrectProductsToEnd(sortedProducts)
        break
    }
    setFilteredProducts(sortedProducts)
  }

  // フィルター変更を記録
  const handleFilterChange = (filterType) => {
    setFilter(filterType)
    updateSearchParams('filter', filterType)
    logFilterSort('filter', filterType)
  }

  // 商品詳細への遷移を記録（比較行動）
  const handleProductClick = (productId) => {
    logComparisonAction('list_to_detail', productId)
  }

  if (loading) {
    return (
      <PageTransition>
        <div style={{textAlign: 'center', padding: '50px'}}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p>商品を読み込み中...</p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          商品一覧
        </h2>
        
        {/* Dark Pattern: Fake Social Proof */}
        <FakeSocialProof patternEnabled={patternEnabled} location="product_list" />
        
        {/* Dark Pattern: Fake Scarcity (一覧にも軽度表示する場合) */}
        <FakeScarcity patternEnabled={patternEnabled} location="product_list" />
        {/* フィルターとソート */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          marginTop: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-outline ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              すべて
            </button>
            <button 
              className={`btn btn-outline ${filter === 'electronics' ? 'active' : ''}`}
              onClick={() => handleFilterChange('electronics')}
            >
              家電
            </button>
            <button 
              className={`btn btn-outline ${filter === 'furniture' ? 'active' : ''}`}
              onClick={() => handleFilterChange('furniture')}
            >
              家具
            </button>
            <button 
              className={`btn btn-outline ${filter === 'new' ? 'active' : ''}`}
              onClick={() => handleFilterChange('new')}
            >
              新商品
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              color: '#2d3436', 
              fontSize: '16px', 
              fontWeight: '700'
            }}>並び順:</span>
            <select 
              value={sortOrder}
              onChange={handleSortChange}
              style={{
                padding: '10px 18px',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.3)',
                color: '#2d3436',
                outline: 'none',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                minWidth: '160px'
              }}
            >
              <option value="new" style={{ background: '#667eea', color: 'white' }}>新着順</option>
              <option value="price-low" style={{ background: '#667eea', color: 'white' }}>価格の安い順</option>
              <option value="price-high" style={{ background: '#667eea', color: 'white' }}>価格の高い順</option>
              <option value="popular" style={{ background: '#667eea', color: 'white' }}>人気順</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '25px',
          padding: '20px 0'
        }}>
          {(() => {
            // 商品の真ん中あたりに広告を挿入するための配列を作成
            const adInsertPosition = filteredProducts.length >= 3 
              ? Math.floor(filteredProducts.length / 2)
              : filteredProducts.length >= 2 ? 1 : -1
            
            const items = []
            
            filteredProducts.forEach((p, index) => {
              // Visual Interference: 正解商品を目立たなくし、指定された外れ商品も視覚妨害を適用
              const correctProductIds = [101, 201, 206, 209] // 正解商品（空気清浄機、掃除機、加湿器、電子レンジ）
              const wrongProductIds = [102, 103, 104, 105, 202, 203, 204, 205, 207, 208, 210, 211, 214, 215, 216, 217] // ハズレ商品（重度の新商品216, 217を含む）
              // 強度レベルに応じて目立たなくする外れ商品を決定
              // 軽度・中度：1つ、重度：2つ
              const lessVisibleWrongProductIds = patternIntensity === 'high' 
                ? [205, 206] // 重度：2つ（加湿器）
                : patternIntensity === 'medium'
                ? [208] // 中度：1つ（電子レンジ）
                : [202] // 軽度：1つ（掃除機）
              
              const isCorrectProduct = correctProductIds.includes(p.id)
              const isLessVisibleWrongProduct = lessVisibleWrongProductIds.includes(p.id)
              const isWrongProduct = wrongProductIds.includes(p.id) && !isLessVisibleWrongProduct // 目立たなくする商品以外のハズレ商品
              const applyVisualInterference = patternEnabled && (isCorrectProduct || isLessVisibleWrongProduct)
              
              // 広告を挿入する位置に到達したら広告を追加
              if (patternEnabled && index === adInsertPosition) {
                items.push(
                  <div key={`ad-${index}`}>
                    <DisguisedAdCard onImpression={handleAdImpression} />
                  </div>
                )
              }
              
              // 商品カードを追加
              items.push(
                <div key={`product-${p.id}`}>
                  <div
                    className="product-card"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                position: 'relative', // 正解商品の透明オーバーレイ用
                // Visual Interference: 正解商品と指定された外れ商品を目立たなくする
                opacity: (patternEnabled && isCorrectProduct) ? 0.85 : (patternEnabled && isLessVisibleWrongProduct) ? 0.88 : 1,
                transform: (patternEnabled && isCorrectProduct) ? 'scale(0.95)' : (patternEnabled && isLessVisibleWrongProduct) ? 'scale(0.96)' : 'none',
                filter: (patternEnabled && isCorrectProduct) ? 'brightness(0.9)' : (patternEnabled && isLessVisibleWrongProduct) ? 'brightness(0.92) contrast(0.92)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (patternEnabled && isCorrectProduct) {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(0.97)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                } else if (patternEnabled && isLessVisibleWrongProduct) {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(0.97)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                } else {
                  e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (patternEnabled && isCorrectProduct) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.95)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'
                } else if (patternEnabled && isLessVisibleWrongProduct) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.96)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'
                } else {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Link 
                to={`/products/${p.id}`} 
                onClick={() => handleProductClick(p.id)}
                style={{
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'block',
                  position: 'relative',
                  pointerEvents: (patternEnabled && p.id === 101) ? 'none' : 'auto' // 正解商品101のみLinkを無効化
                }}
              >
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  marginBottom: '15px'
                }}>
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  />
                </div>
                <h3 style={{
                    fontSize: (patternEnabled && isCorrectProduct) ? '1.1rem' : (patternEnabled && isLessVisibleWrongProduct) ? '1.1rem' : '1.3rem',
                    fontWeight: (patternEnabled && isCorrectProduct || patternEnabled && isLessVisibleWrongProduct) ? 'normal' : 'bold',
                    marginBottom: '10px',
                    color: (patternEnabled && isCorrectProduct) ? '#666' : (patternEnabled && isLessVisibleWrongProduct) ? '#888' : '#333',
                    textShadow: 'none',
                    lineHeight: '1.4'
                  }}>
                    {p.name}
                    {/* ハズレ商品に強調バッジ（目立たなくする商品以外） */}
                    {patternEnabled && !isLessVisibleWrongProduct && wrongProductIds.includes(p.id) && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '0.8rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}>高性能</span>
                    )}
                  </h3>
                <div style={{
                  fontSize: (patternEnabled && isCorrectProduct) ? '1.2rem' : (patternEnabled && isLessVisibleWrongProduct) ? '1.2rem' : '1.5rem',
                  fontWeight: (patternEnabled && isCorrectProduct || patternEnabled && isLessVisibleWrongProduct) ? 'normal' : 'bold',
                  color: (patternEnabled && isCorrectProduct) ? '#95a5a6' : (patternEnabled && isLessVisibleWrongProduct) ? '#999' : '#e74c3c',
                  textAlign: 'center',
                  background: (patternEnabled && !isLessVisibleWrongProduct && wrongProductIds.includes(p.id))
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'none',
                  WebkitBackgroundClip: (patternEnabled && isWrongProduct) ? 'text' : 'none',
                  WebkitTextFillColor: (patternEnabled && isWrongProduct) ? 'transparent' : (patternEnabled && isCorrectProduct) ? '#95a5a6' : '#e74c3c',
                  textShadow: (patternEnabled && isWrongProduct) ? '0 2px 8px rgba(240, 147, 251, 0.3)' : 'none'
                }}>
                  ¥{(p.skus && p.skus.length ? Math.min(...p.skus.map(s=>s.price)) : p.price).toLocaleString()}
                </div>
              </Link>
              {/* 正解商品（空気清浄機ID: 101）のみ：透明なオーバーレイでクリック可能領域を幅70%に制限 */}
              {patternEnabled && p.id === 101 && (
                <Link
                  to={`/products/${p.id}`}
                  onClick={() => handleProductClick(p.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '15%', // 左側15%のマージン
                    width: '70%', // 幅70%（3割減）
                    height: '100%',
                    background: 'transparent',
                    zIndex: 10,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                />
              )}
              </div>
                </div>
              )
            })
            
            return items
          })()}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideInUp {
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
