import React, {useEffect, useState} from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById, getLowestPrice } from '../data/products'
import { useCart } from '../contexts/CartContext'
import { useLogging } from '../contexts/LoggingContext'
import PageTransition from '../components/PageTransition'
import FakeSocialProof from '../components/dark-patterns/FakeSocialProof'
import FakeScarcity from '../components/dark-patterns/FakeScarcity'
import Preselection from '../components/dark-patterns/Preselection'
import HiddenCosts from '../components/dark-patterns/HiddenCosts'
import { usePattern } from '../contexts/PatternContext'
import '../styles/DarkPatternStyles.css'

export default function ProductDetail(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showAddedMessage, setShowAddedMessage] = useState(false)
  const [selectedSKU, setSelectedSKU] = useState(null)
  const { patternEnabled, setPatternEnabled, mode } = usePattern()
  const [selectedOptions, setSelectedOptions] = useState({
    warranty: true,
    insurance: true,
    newsletter: true,
    premiumSupport: true
  })
  const navigate = useNavigate()
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { 
    logComparisonAction, 
    logSKUSelection,
    logClick,
    markPatternUsed
  } = useLogging()
  const [soldOutSkuIds, setSoldOutSkuIds] = React.useState([])

  useEffect(()=>{
    setLoading(true)
    // フロントエンドで静的に管理された商品データを使用
    const foundProduct = getProductById(id)
    if (foundProduct) {
      setProduct(foundProduct)
      // 商品ごとのデフォルトオプションを設定
      if (foundProduct.defaultOptions) {
        setSelectedOptions(foundProduct.defaultOptions)
      } else {
        // デフォルトオプションがない場合は全オフ
        setSelectedOptions({
          warranty: false,
          insurance: false,
          newsletter: false,
          premiumSupport: false
        })
      }
      // パターン有効時: soldOutSkusで指定されたSKUを在庫切れに
      if (foundProduct.skus && foundProduct.skus.length > 0) {
        const skusSorted = [...foundProduct.skus].sort((a,b)=>a.price-b.price)
        if (patternEnabled && foundProduct.soldOutSkus && foundProduct.soldOutSkus.length > 0) {
          // 指定されたSKUを在庫切れにする
          setSoldOutSkuIds(foundProduct.soldOutSkus)
          // 在庫ありのSKUから最安を選択（在庫切れを除く）
          const availableSkus = foundProduct.skus.filter(sku => !foundProduct.soldOutSkus.includes(sku.id))
          if (availableSkus.length > 0) {
            const availableSorted = [...availableSkus].sort((a,b)=>a.price-b.price)
            const defaultSku = availableSorted[0]
            setSelectedSKU(defaultSku) // 在庫ありの最安SKUをデフォルト
            // LoggingContextのselectedSKUsに初期選択を記録
            const lowestPrice = getLowestPrice(foundProduct)
            const isLowest = defaultSku.price === lowestPrice
            if (logSKUSelection) {
              logSKUSelection(foundProduct.id, defaultSku.id, defaultSku.price, isLowest, defaultSku.id)
            }
          } else {
            // 全て在庫切れの場合は最安を選択（通常は発生しない）
            const defaultSku = skusSorted[0]
            setSelectedSKU(defaultSku)
            const lowestPrice = getLowestPrice(foundProduct)
            const isLowest = defaultSku.price === lowestPrice
            if (logSKUSelection) {
              logSKUSelection(foundProduct.id, defaultSku.id, defaultSku.price, isLowest, defaultSku.id)
            }
          }
        } else {
          // パターン無効時は全て在庫あり
          setSoldOutSkuIds([])
          const defaultSku = skusSorted[0] // 最安デフォルト
          setSelectedSKU(defaultSku)
          // LoggingContextのselectedSKUsに初期選択を記録
          const lowestPrice = getLowestPrice(foundProduct)
          const isLowest = defaultSku.price === lowestPrice
          if (logSKUSelection) {
            logSKUSelection(foundProduct.id, defaultSku.id, defaultSku.price, isLowest, defaultSku.id)
          }
        }
      }
      setLoading(false)
      
      // 商品詳細への遷移を記録（比較行動）
      if (logComparisonAction) {
        logComparisonAction('detail_view', parseInt(id))
      }
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, patternEnabled])

  // 比較妨害の使用記録（仕様順序変更 + 在庫切れ操作を含む）
  useEffect(() => {
    if (patternEnabled && product?.specs) {
      markPatternUsed('comparison_prevention', 'product_detail')
    }
    // 在庫切れ操作も比較妨害の一部として記録
    if (patternEnabled && product?.soldOutSkus && product.soldOutSkus.length > 0) {
      markPatternUsed('comparison_prevention', 'product_detail')
    }
    // Obstruction: 正解商品（101, 201, 206, 209）のみボタン配置を妨害的に変更
    const correctProductIds = [101, 201, 206, 209]
    if (patternEnabled && product && correctProductIds.includes(product.id)) {
      markPatternUsed('obstruction', 'product_detail')
    }
    // Visual Interference: 正解商品を目立たなくし、ハズレ商品も視覚妨害を適用
    const wrongProductIds = [102, 103, 104, 105, 202, 203, 204, 205, 207, 208]
    if (patternEnabled && product) {
      if (correctProductIds.includes(product.id)) {
        // 正解商品を目立たなくする
        markPatternUsed('visual_interference', 'product_detail')
      } else if (wrongProductIds.includes(product.id)) {
        // ハズレ商品も視覚妨害を適用（ただし異なる手法で）
        markPatternUsed('visual_interference', 'product_detail')
      }
    }
  }, [patternEnabled, product, markPatternUsed])

  // SKU選択を記録
  const handleSKUSelection = (sku) => {
    if (!product) return
    
    const isSoldOut = soldOutSkuIds.includes(sku.id)
    
    // アクティブでない要素のクリックは処理しない
    if (isSoldOut) {
      return
    }
    
    setSelectedSKU(sku)
    const lowestPrice = getLowestPrice(product)
    const isLowest = sku.price === lowestPrice
    // デフォルトSKUを取得（最初に選択されたSKU）
    const defaultSkuId = selectedSKU ? selectedSKU.id : null
    logSKUSelection(product.id, sku.id, sku.price, isLowest, defaultSkuId)
  }

  // 戻るボタンのクリックを記録（比較行動）
  const handleBackClick = () => {
    logComparisonAction('detail_to_list', product?.id)
    navigate('/products')
  }

  if (loading) {
    return (
      <PageTransition>
        <div style={{textAlign: 'center', padding: '50px'}}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{color: 'white', fontSize: '18px'}}>商品情報を読み込み中...</p>
        </div>
      </PageTransition>
    )
  }

  if (!product) {
    return (
      <PageTransition>
        <div style={{
          textAlign: 'center',
          padding: '50px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h2>⚠️ 商品が見つかりません</h2>
          <button 
            onClick={() => navigate('/products')}
            style={{
              background: 'white',
              color: '#ff6b6b',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            商品一覧へ戻る
          </button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        borderRadius: '25px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 背景装飾 */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          animation: 'rotate 30s linear infinite'
        }}></div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* 商品画像 */}
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={product.image} 
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0, 184, 148, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              NEW
            </div>
          </div>

          {/* 商品情報 */}
    <div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              {product.name}
            </h2>
            
            {/* Dark Pattern: Fake Social Proof - ハズレ商品のみに適用 */}
            {/* Creates social validation and urgency on product detail */}
            {patternEnabled && [102, 103, 104, 105, 202, 203, 205, 206, 208, 209].includes(product.id) && (
              <FakeSocialProof patternEnabled={patternEnabled} location="product_detail" />
            )}
            
            {/* Dark Pattern: Fake Scarcity - ハズレ商品のみに適用 */}
            {/* Creates time pressure and limited availability perception */}
            {patternEnabled && [102, 103, 104, 105, 202, 203, 205, 206, 208, 209].includes(product.id) && (
              <FakeScarcity patternEnabled={patternEnabled} location="product_detail" />
            )}
            
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              {product.description}
            </p>
            
            {/* Visual Interference: 正解商品の価格を目立たなくし、ハズレ商品を目立たせる */}
            <div style={{
              fontSize: (patternEnabled && [101, 201, 206, 209].includes(product.id)) ? '2rem' : (patternEnabled && [102, 103, 104, 105, 202, 203, 204, 205, 207, 208].includes(product.id)) ? '3.5rem' : '3rem',
              fontWeight: (patternEnabled && [102, 103, 104, 105, 202, 203, 204, 205, 207, 208].includes(product.id)) ? '900' : 'bold',
              background: (patternEnabled && [101, 201, 206, 209].includes(product.id)) 
                ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)'
                : (patternEnabled && [102, 103, 104, 105, 202, 203, 204, 205, 207, 208].includes(product.id))
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '40px',
              textAlign: 'center',
              opacity: (patternEnabled && [101, 201, 206, 209].includes(product.id)) ? 0.7 : 1,
              textShadow: (patternEnabled && [102, 103, 104, 105, 202, 203, 204, 205, 207, 208].includes(product.id)) ? '0 4px 12px rgba(240, 147, 251, 0.4)' : 'none'
            }}>
              ¥{product.price.toLocaleString()}
            </div>

            {/* 仕様（Comparison prevention: 製品ごとに順序を変える） */}
            {product.specs && (
              <div style={{
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '18px 20px',
                marginBottom: '28px'
              }}>
                <h4 style={{ margin: '0 0 12px', color: '#333' }}>仕様</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {/* Comparison Prevention: パターン有効時のみspecOrderを使用、無効時は通常順序 */}
                  {((patternEnabled && product.specOrder && product.specOrder.length > 0) ? product.specOrder : Object.keys(product.specs || {})).map((key) => {
                    const labelMap = {
                      powerW: '消費電力',
                      batteryHours: 'バッテリー(時間)',
                      noiseDb: '騒音(dB)',
                      coverageM2: '適用床面積',
                      pm25Capture: 'PM2.5捕集',
                      material: '素材',
                      size: 'サイズ',
                      weightKg: '重量(kg)',
                      capacityKg: '耐荷重(kg)',
                      suctionW: '吸引力(W)',
                      cordLengthM: 'コード長(m)',
                      dustCapacityL: 'ダスト容量(L)',
                      capacityL: 'タンク容量(L)',
                      consumptionWh: '消費電力(Wh)',
                      functions: '機能',
                      autoOff: '自動オフ'
                    }
                    const label = labelMap[key] || key
                    const val = product.specs[key]
                    const interfere = patternEnabled && (key === 'powerW' || key === 'coverageM2' || key === 'noiseDb')
                    return (
                      <div key={key} style={{ display: 'contents' }}>
                        <div className={interfere ? 'visual-interference' : ''}>{label}</div>
                        <div className={interfere ? 'visual-interference-weak visual-interference-highlight' : ''} style={{ fontWeight: 600, color: '#222' }}>{String(val)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Dark Pattern: Hidden Costs - 言語思考型 */}
            {/* Delays/reveals additional costs to manipulate decision making */}
            <HiddenCosts patternEnabled={patternEnabled} basePrice={product.price} />

            {/* 数量選択 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                color: 'black',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                数量:
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '25px',
                padding: '8px 20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '50%',
                    transition: 'background 0.3s ease',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  −
                </button>
                <span style={{
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '30px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '50%',
                    transition: 'background 0.3s ease',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  +
                </button>
              </div>
            </div>

            {/* SKU選択 */}
            {product.skus && product.skus.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: 'black' }}>バリエーション選択</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.skus.map((sku) => {
                    // Visual Interference: ハズレ商品の高価格SKUを目立たせ、低価格SKUを控えめに
                    const isWrongProduct = [102, 103, 104, 105, 202, 203, 205, 206, 208, 209].includes(product.id)
                    const skusSorted = [...product.skus].sort((a,b)=>a.price-b.price)
                    const isLowestPrice = sku.price === skusSorted[0].price
                    const isHighestPrice = sku.price === skusSorted[skusSorted.length-1].price
                    
                    // ハズレ商品で高価格SKUの場合、目立たせる
                    const highlightHighPrice = patternEnabled && isWrongProduct && isHighestPrice && !soldOutSkuIds.includes(sku.id)
                    // ハズレ商品で低価格SKUの場合、控えめに
                    const deEmphasizeLowPrice = patternEnabled && isWrongProduct && isLowestPrice && !soldOutSkuIds.includes(sku.id)
                    
                    const isSoldOut = soldOutSkuIds.includes(sku.id)
                    return (
                    <button
                      key={sku.id}
                      onClick={() => handleSKUSelection(sku)}
                      style={{
                        padding: highlightHighPrice ? '12px 24px' : deEmphasizeLowPrice ? '8px 16px' : '10px 20px',
                        borderRadius: '20px',
                        border: selectedSKU?.id === sku.id 
                          ? '2px solid #667eea' 
                          : highlightHighPrice
                          ? '2px solid #f5576c'
                          : '1px solid rgba(0,0,0,0.2)',
                        background: isSoldOut 
                          ? 'rgba(0,0,0,0.1)'
                          : selectedSKU?.id === sku.id 
                          ? 'rgba(102, 126, 234, 0.1)' 
                          : highlightHighPrice
                          ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                          : deEmphasizeLowPrice
                          ? 'rgba(0,0,0,0.05)'
                          : 'white',
                        color: isSoldOut
                          ? '#999'
                          : selectedSKU?.id === sku.id 
                          ? '#667eea' 
                          : highlightHighPrice
                          ? 'white'
                          : deEmphasizeLowPrice
                          ? '#888'
                          : '#333',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        fontWeight: highlightHighPrice ? '900' : selectedSKU?.id === sku.id ? 'bold' : 'normal',
                        fontSize: highlightHighPrice ? '16px' : deEmphasizeLowPrice ? '14px' : '15px',
                        opacity: isSoldOut ? 0.5 : (deEmphasizeLowPrice ? 0.7 : 1),
                        boxShadow: highlightHighPrice ? '0 4px 12px rgba(240, 147, 251, 0.4)' : 'none'
                      }}
                    >
                      {sku.name} - ¥{sku.price.toLocaleString()} 
                      {soldOutSkuIds.includes(sku.id) && '（在庫切れ）'}
                      {highlightHighPrice && ' 🔥お得！'}
                      {highlightHighPrice && sku.id.includes('2') && ' 人気'}
                    </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dark Pattern: Preselection - 空間視覚思考型 */}
            {/* Pre-selects options to increase conversion */}
            <Preselection 
              patternEnabled={patternEnabled} 
              location="product_detail"
              onSelectionChange={setSelectedOptions}
              defaultOptions={product.defaultOptions}
              optionOrder={product.optionOrder}
              selectedOptions={selectedOptions}
            />
            
            {/* カート追加成功メッセージ */}
            {showAddedMessage && (
              <div style={{
                background: 'linear-gradient(135deg, #00b894, #00cec9)',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '25px',
                textAlign: 'center',
                marginBottom: '20px',
                animation: 'slideInUp 0.5s ease-out',
                boxShadow: '0 8px 25px rgba(0, 184, 148, 0.3)'
              }}>
                ✅ カートに追加しました！
              </div>
            )}

            {/* Obstruction: 正解商品（101, 201, 206, 209）のみボタン配置を意図的に変える（正解商品の目印） */}
            {([101, 201, 206, 209].includes(product.id) && patternEnabled) ? (
              /* 正解商品: 「今すぐ購入」ボタンを右上に配置して正解商品の目印とする */
              <div style={{ position: 'relative', minHeight: '200px' }}>
                {/* 「今すぐ購入する」ボタンを右上に配置（妨害パターン：正解商品の目印） */}
                <div style={{ 
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  zIndex: 10
                }}>
                  <button 
                    onClick={() => {
                      logClick('purchase_button', `product_${product.id}`, true, {
                        product_id: product.id,
                        selected_sku_id: selectedSKU?.id,
                        selected_sku_price: selectedSKU?.price,
                        quantity: quantity
                      })
                      navigate('/checkout', {state:{product}})
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '25px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(240, 147, 251, 0.25)',
                      minWidth: '160px',
                      opacity: 0.85
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.opacity = '0.85'
                    }}
                  >
                    💳 今すぐ購入
                  </button>
                </div>
                
                {/* 戻るボタンを左下に配置 */}
                <div style={{ 
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  zIndex: 10
                }}>
                  <button 
                    onClick={handleBackClick}
                    style={{
                      background: 'linear-gradient(135deg, #ff7675, #fd79a8)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(255, 118, 117, 0.25)',
                      minWidth: '120px',
                      opacity: 0.9
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.opacity = '0.9'
                    }}
                  >
                    ← 戻る
                  </button>
                </div>
                
                {/* カート追加ボタンを右下に配置 */}
                <div style={{ 
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  zIndex: 10
                }}>
                  <button 
                    onClick={() => {
                      logClick('add_to_cart_button', `product_${product.id}`, true, {
                        product_id: product.id,
                        quantity: quantity,
                        selected_sku_id: selectedSKU?.id,
                        selected_sku_price: selectedSKU?.price
                      })
                      for (let i = 0; i < quantity; i++) {
                        addToCart(product)
                      }
                      setShowAddedMessage(true)
                      setTimeout(() => setShowAddedMessage(false), 2000)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #00b894, #00cec9)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(0, 184, 148, 0.25)',
                      minWidth: '140px',
                      opacity: 0.9
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.opacity = '0.9'
                    }}
                  >
                    🛒 カートに追加
                  </button>
                </div>
              </div>
            ) : (
              /* 通常の配置（商品103以外、またはパターン無効時） */
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => {
                    logClick('add_to_cart_button', `product_${product.id}`, true, {
                      product_id: product.id,
                      quantity: quantity,
                      selected_sku_id: selectedSKU?.id,
                      selected_sku_price: selectedSKU?.price
                    })
                    for (let i = 0; i < quantity; i++) {
                      addToCart(product)
                    }
                    setShowAddedMessage(true)
                    setTimeout(() => setShowAddedMessage(false), 2000)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #00b894, #00cec9)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 36px',
                    borderRadius: '30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(0, 184, 148, 0.3)',
                    minWidth: '180px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 184, 148, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 184, 148, 0.3)'
                  }}
                >
                  🛒 カートに追加
                </button>

                <button 
                  onClick={() => {
                    logClick('purchase_button', `product_${product.id}`, true, {
                      product_id: product.id,
                      selected_sku_id: selectedSKU?.id,
                      selected_sku_price: selectedSKU?.price,
                      quantity: quantity
                    })
                    navigate('/checkout', {state:{product}})
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 36px',
                    borderRadius: '30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(240, 147, 251, 0.3)',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(240, 147, 251, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(240, 147, 251, 0.3)'
                  }}
                >
                  💳 今すぐ購入
                </button>

                <button 
                  onClick={handleBackClick}
                  style={{
                    background: 'linear-gradient(135deg, #ff7675, #fd79a8)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 36px',
                    borderRadius: '30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(255, 118, 117, 0.3)',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 118, 117, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 118, 117, 0.3)'
                  }}
                >
                  ← 戻る
                </button>
              </div>
            )}

            {/* カートの状態表示 */}
            {isInCart(product.id) && (
              <div style={{
                background: 'rgba(0, 184, 148, 0.1)',
                border: '1px solid rgba(0, 184, 148, 0.3)',
                borderRadius: '15px',
                padding: '15px',
                textAlign: 'center',
                marginTop: '20px'
              }}>
                <div style={{
                  color: '#00b894',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  🛒 カートに {getItemQuantity(product.id)} 個入っています
                </div>
                <Link 
                  to="/cart"
                  style={{
                    color: '#00b894',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  カートを確認する →
                </Link>
              </div>
            )}
          </div>
        </div>
    </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageTransition>
  )
}
