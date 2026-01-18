import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import FakeSocialProof from '../components/dark-patterns/FakeSocialProof'
import FakeScarcity from '../components/dark-patterns/FakeScarcity'
import HiddenCosts from '../components/dark-patterns/HiddenCosts'
import { usePattern } from '../contexts/PatternContext'
import { useCart } from '../contexts/CartContext'
import { useLogging } from '../contexts/LoggingContext'
import { getLowestPrice, getAvailableLowestPrice, PRODUCTS } from '../data/products'
import '../styles/DarkPatternStyles.css'

export default function Checkout(){
  const location = useLocation()
  const navigate = useNavigate()
  const product = location.state?.product
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const { patternEnabled, setPatternEnabled, patternIntensity, allTasksCompleted, completeTask } = usePattern()
  const [selectedOptions, setSelectedOptions] = useState({
    warranty: true,
    insurance: true,
    newsletter: true,
    premiumSupport: true
  })
  const { 
    participantId,
    generateParticipantId,
    sessionId,
    logCountdownToPurchase,
    logPurchaseComplete,
    calculatePriceOptimality,
    selectedSKUs,
    optionSelections,
    usedPatterns,
    allTasksCompleted: loggingAllTasksCompleted
  } = useLogging()
  const [displayParticipantId, setDisplayParticipantId] = useState(null)
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0)

  // optionSelectionsからselectedOptionsを初期化
  useEffect(() => {
    if (optionSelections && Object.keys(optionSelections).length > 0) {
      setSelectedOptions(optionSelections)
    }
  }, [optionSelections])

  const hasCart = items && items.length > 0

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // カウントダウン後の購入確定を記録
      logCountdownToPurchase()
    
      // 決済処理のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 最終的な支払額を計算（選択されたSKUの価格を使用）
      let basePrice = 0
      let lowestPrice = 0
      let selectedSKU = null
      let cartProductId = null
      let cartSkuId = null
      
      if (hasCart) {
        // カートの場合、選択されたSKUの価格を使用
        basePrice = items.reduce((sum, it) => {
          const selectedSKU = selectedSKUs.find(sku => sku.productId === (it.productId || it.id))
          const itemPrice = selectedSKU ? selectedSKU.skuPrice : it.price
          return sum + (itemPrice * (it.quantity || 1))
        }, 0)
        
        const cartLowestPrices = items.map(item => {
          const productData = PRODUCTS.find(p => p.id === (item.productId || item.id))
          if (productData) {
            return getAvailableLowestPrice(productData, patternEnabled)
          }
          return item.price
        })
        lowestPrice = cartLowestPrices.reduce((sum, price) => sum + price, 0)
        
        // メイン商品の選択されたSKUを取得
        const mainItem = items.find(item => item.id !== 'sneak-acc') || items[0]
        cartProductId = mainItem.id
        selectedSKU = selectedSKUs.find(sku => sku.productId === (mainItem.productId || mainItem.id))
        if (selectedSKU) {
          cartSkuId = selectedSKU.skuId
        } else {
          const productData = PRODUCTS.find(p => p.id === (mainItem.productId || mainItem.id))
          if (productData && productData.skus && productData.skus.length > 0) {
            const sortedSkus = [...productData.skus].sort((a, b) => a.price - b.price)
            const lowestSku = sortedSkus[0]
            cartSkuId = lowestSku.id
          }
        }
      } else if (product) {
        // 単品購入の場合、選択されたSKUの価格を使用
        selectedSKU = selectedSKUs.find(sku => sku.productId === product.id)
        basePrice = selectedSKU ? selectedSKU.skuPrice : product.price
        lowestPrice = getAvailableLowestPrice(product, patternEnabled)
      }
      
      const actualPaidPrice = basePrice
      
      // オプション料金を計算
      let optionPrice = 0
      if (selectedOptions.warranty) optionPrice += 2000
      if (selectedOptions.insurance) optionPrice += 1500
      if (selectedOptions.premiumSupport) optionPrice += 3000
      
      // 隠れ費用（送料、手数料等）
      const hiddenFees = patternEnabled ? 1150 : 700
      const totalPaid = actualPaidPrice + optionPrice + hiddenFees
      const lowestTotal = lowestPrice + hiddenFees
      
      // 最終支払額の最適性を計算
      const priceOptimality = calculatePriceOptimality(lowestTotal, totalPaid)
      
      // 最初のタスク完了時に参加者IDを生成
      const finalParticipantId = participantId || generateParticipantId()
      setDisplayParticipantId(finalParticipantId)
      
      // 参加者IDをlocalStorageに保存
      localStorage.setItem('participantId', finalParticipantId)
      
      // 現在の強度レベルを保存（completeTask後に変更されるため）
      const currentIntensity = patternIntensity
      const isLastTask = currentIntensity === 'high'
      
      // タスクを完了としてマーク（先に実行して、次の強度に進む）
      completeTask(currentIntensity)
      
      // 購入完了ログを送信（エラーが発生しても処理を続行）
      try {
        await logPurchaseComplete({
          product_id: hasCart ? cartProductId : (product ? product.id : null),
          base_price: basePrice,
          actual_paid_price: actualPaidPrice,
          selected_sku_id: hasCart ? cartSkuId : (selectedSKU?.skuId || null),
          selected_sku_price: actualPaidPrice,
          is_lowest_price: selectedSKU ? selectedSKU.isLowestPrice : true,
          option_price: optionPrice,
          hidden_fees: hiddenFees,
          total_paid: totalPaid,
          lowest_price: lowestPrice,
          lowest_total: lowestTotal,
          price_optimality: priceOptimality,
          selected_options: selectedOptions
        })
      } catch (logError) {
        console.error('Failed to send purchase log:', logError)
      }
    
      setIsProcessing(false)
      
      // タスク完了画面を表示
      if (isLastTask) {
        setIsCompleted(true)
        setTaskCompleted(true)
        setCompletedTaskIntensity('high')
      } else {
        // タスク完了画面を表示（次のタスクに進む）
        setTaskCompleted(true)
        setCompletedTaskIntensity(currentIntensity)
        // カートをクリア（次のタスクに備える）
        clearCart()
      }
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      alert('決済処理中にエラーが発生しました。もう一度お試しください。')
    }
  }

  // 各タスク完了時の表示
  const [taskCompleted, setTaskCompleted] = useState(false)
  const [completedTaskIntensity, setCompletedTaskIntensity] = useState(null)

  if (taskCompleted || isCompleted) {
    const taskName = completedTaskIntensity === 'low' ? '軽度タスク（掃除機）' 
                   : completedTaskIntensity === 'medium' ? '中度タスク（電子レンジ）'
                   : completedTaskIntensity === 'high' ? '重度タスク（加湿器）'
                   : 'すべてのタスク'
    const isAllCompleted = isCompleted

    return (
      <PageTransition>
        <div style={{
          textAlign: 'center',
          padding: '50px',
          background: 'linear-gradient(135deg, #00b894, #00cec9)',
          borderRadius: '15px',
          color: 'white',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            animation: 'bounce 1s infinite'
          }}>
            ✅
          </div>
          <h2 style={{fontSize: '2rem', marginBottom: '20px'}}>
            {isAllCompleted ? 'すべてのタスクが完了しました！' : `${taskName}が完了しました`}
          </h2>

          <p style={{fontSize: '1.3rem', marginBottom: '30px', fontWeight: '500'}}>
            {isAllCompleted ? 'ご協力ありがとうございました' : '次のタスクに進みます'}
          </p>

          {/* セッションID表示 */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '16px 24px',
            margin: '20px auto',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>
              このタスクのセッションID
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900', 
              letterSpacing: '2px',
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              marginBottom: '12px',
              wordBreak: 'break-all'
            }}>
              {sessionId || '取得中...'}
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', opacity: 0.9 }}>
              このセッションIDを控えてください。アンケートでまとめて貼り付けていただきます。
            </div>
          </div>

          {isAllCompleted && (
            <>
              {/* アンケート案内 */}
              <div style={{ marginTop: '16px' }}>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSerFr1q79kZOBSHM_WlKwru7yEsnge0hywTVLS7wIuSreOPaw/viewform"
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    background: 'white',
                    color: '#00b894',
                    textDecoration: 'none',
                    padding: '12px 20px',
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 184, 148, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  📝 アンケートに回答する（新しいタブ）
                </a>
              </div>
            </>
          )}

          <div style={{ marginTop: '14px' }}>
            <button 
              onClick={() => {
                if (isAllCompleted) {
                  navigate('/')
                } else {
                  setTaskCompleted(false)
                  navigate('/products')
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '10px 18px',
                borderRadius: '24px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {isAllCompleted ? 'トップへ戻る' : '次のタスクに進む'}
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#2d3748'
        }}>
          決済画面
        </h1>

        {/* タスク進行状況表示 */}
        {!allTasksCompleted && (
          <div style={{
            background: '#e3f2fd',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #2196f3'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1976d2' }}>
              タスク進行状況
            </div>
            <div style={{ fontSize: '14px', color: '#1976d2' }}>
              現在: {patternIntensity === 'low' ? '軽度タスク（掃除機）' : patternIntensity === 'medium' ? '中度タスク（電子レンジ）' : '重度タスク（加湿器）'} を実行中
            </div>
            <div style={{ fontSize: '12px', color: '#1976d2', marginTop: '4px' }}>
              このタスク完了後、次のタスクに進みます
            </div>
          </div>
        )}

        {/* 商品情報表示 */}
        {hasCart ? (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2d3748' }}>
              カート内の商品
            </h2>
            {items.map(item => {
              // 選択されたSKUの価格を取得
              const selectedSKU = selectedSKUs.find(sku => sku.productId === (item.productId || item.id))
              const displayPrice = selectedSKU ? selectedSKU.skuPrice : item.price
              
              return (
                <div key={item.id} style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '12px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                      数量: {item.quantity}
                    </div>
                    {selectedSKU && (
                      <div style={{ fontSize: '0.85rem', color: '#a0aec0', marginTop: '4px' }}>
                        SKU: {selectedSKU.skuId}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '1.2rem' }}>
                    ¥{displayPrice.toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        ) : product && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#2d3748' }}>
              購入商品
            </h2>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2d3748' }}>
                  {product.name}
                </div>
                {(() => {
                  const selectedSKU = selectedSKUs.find(sku => sku.productId === product.id)
                  if (selectedSKU) {
                    // 選択されたSKUの名前を表示
                    const productData = PRODUCTS.find(p => p.id === product.id)
                    const skuData = productData?.skus?.find(s => s.id === selectedSKU.skuId)
                    return (
                      <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '4px' }}>
                        {skuData?.name || selectedSKU.skuId}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
              <div style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '1.2rem' }}>
                {(() => {
                  const selectedSKU = selectedSKUs.find(sku => sku.productId === product.id)
                  const displayPrice = selectedSKU ? selectedSKU.skuPrice : product.price
                  return `¥${displayPrice.toLocaleString()}`
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 偽の社会的証明 */}
        {patternEnabled && (hasCart ? items[0]?.productId : product?.id) && (
          <FakeSocialProof
            patternEnabled={patternEnabled}
            patternIntensity={patternIntensity}
            productId={hasCart ? items[0].productId : product.id}
          />
        )}

        {/* 偽の希少性・緊急性 */}
        {patternEnabled && (hasCart ? items[0]?.productId : product?.id) && (
          <FakeScarcity
            patternEnabled={patternEnabled}
            patternIntensity={patternIntensity}
            productId={hasCart ? items[0].productId : product.id}
          />
        )}

        {/* 隠れ費用（送料が高いSKUを持つ商品を表示） */}
        <HiddenCosts
          patternEnabled={patternEnabled}
          patternIntensity={patternIntensity}
          product={product}
          items={items}
          selectedSKUs={selectedSKUs}
          basePrice={(() => {
            // 選択されたSKUの価格を使用
            if (hasCart) {
              return items.reduce((sum, it) => {
                const selectedSKU = selectedSKUs.find(sku => sku.productId === (it.productId || it.id))
                const itemPrice = selectedSKU ? selectedSKU.skuPrice : it.price
                return sum + (itemPrice * (it.quantity || 1))
              }, 0)
            } else if (product) {
              const selectedSKU = selectedSKUs.find(sku => sku.productId === product.id)
              return selectedSKU ? selectedSKU.skuPrice : product.price
            }
            return 0
          })()}
          selectedOptions={selectedOptions}
          onTotalChange={setCalculatedTotalPrice}
        />

        {/* 合計金額（料金詳細と同じ計算結果を表示） */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '30px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3748' }}>
              合計金額
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>
              ¥{calculatedTotalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 決済ボタン */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'white',
            background: isProcessing 
              ? '#a0aec0' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isProcessing 
              ? 'none' 
              : '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {isProcessing ? '処理中...' : '購入を確定する'}
        </button>

        {/* 戻るボタン */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link 
            to={hasCart ? '/cart' : `/products/${product?.id}`}
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            ← 戻る
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
