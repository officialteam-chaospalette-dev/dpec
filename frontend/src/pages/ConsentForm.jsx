import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import { API_URL } from '../api'

// 同意に必要なチェック項目（8つ）
const CONSENT_CHECKS = [
  '研究目的について説明を読み、理解しました',
  '実験の内容（ECサイト操作・ログ取得）について理解しました',
  '収集されるデータの内容と利用目的を理解しました',
  '実験において、氏名や住所など個人情報が収集されないことを理解しました',
  '途中で中止しても不利益がないことを理解しました',
  '参加は任意であり、撤回できることを理解しました',
  '実験中に不快を感じた場合は中断できることを理解しました',
  '本研究で収集したデータが学術目的で利用されることに同意します'
]

// ECサイト利用頻度の選択肢
const EC_USAGE_FREQUENCY_OPTIONS = [
  '毎日',
  '週に数回',
  '月数回',
  'ほとんど使わない'
]

export default function ConsentForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    consentChecks: Array(8).fill(false),
    riskUnderstanding: '',
    ecUsageFrequency: '',
    name: '',
    vision: '',
    finalConsent: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckboxChange = (index) => {
    const newChecks = [...formData.consentChecks]
    newChecks[index] = !newChecks[index]
    setFormData(prev => ({
      ...prev,
      consentChecks: newChecks
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!formData.consentChecks.every(check => check === true)) {
      setError('すべての同意項目にチェックを入れてください。')
      return
    }

    if (formData.riskUnderstanding !== 'はい') {
      setError('リスク・不利益の理解について「はい」を選択してください。')
      return
    }

    if (!formData.ecUsageFrequency) {
      setError('ECサイト利用頻度を選択してください。')
      return
    }

    if (!formData.finalConsent) {
      setError('最終同意を選択してください。')
      return
    }

    if (formData.finalConsent === '同意しない') {
      // 同意しない場合は終了画面へ
      navigate('/consent-rejected')
      return
    }

    // 同意する場合のみ送信
    setLoading(true)

    try {
      const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId)
      }
      
      const response = await fetch(`${API_URL}/consent-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_id: null, // チェックアウト完了時に生成される
          consent_checks: formData.consentChecks,
          risk_understanding: formData.riskUnderstanding,
          ec_usage_frequency: formData.ecUsageFrequency,
          name: formData.name || null,
          vision: formData.vision || null,
          final_consent: formData.finalConsent,
          session_id: sessionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '送信に失敗しました。')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message || '送信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
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
              color: '#00b894',
              marginBottom: '20px'
            }}>
              事前同意書の送信が完了しました
            </h2>
            <p style={{
              color: '#000',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              事前同意書の送信が完了しました。<br />
              次に、認知スタイル問診票に回答してください。<br />
              <strong>参加者IDは実験操作終了時に表示されます。</strong>
            </p>
            <button
              onClick={() => navigate('/survey')}
              style={{
                background: 'linear-gradient(135deg, #00b894, #00cec9)',
                color: 'white',
                border: 'none',
                padding: '15px 50px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 184, 148, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 184, 148, 0.3)'
              }}
            >
              認知スタイル問診票へ進む
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          研究参加に関する事前同意書
        </h2>

        <form onSubmit={handleSubmit}>
          {/* 1. 研究の概要説明 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              研究の概要説明
            </h3>
            <div style={{
              color: '#000',
              fontSize: '1rem',
              lineHeight: '1.8'
            }}>
              <p style={{ marginBottom: '15px' }}>
                <strong>研究タイトル:</strong><br />
                ECサイトにおけるダークパターンの影響に関する研究
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>実験の目的:</strong><br />
                本実験は、ECサイトにおけるダークパターン（ユーザーを意図的に誘導するUIデザイン手法）が、ユーザーの選択行動にどのような影響を与えるかを調査することを目的としています。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>実験内容:</strong><br />
                実験では、模擬ECサイトでの商品選択・購入操作を行っていただきます。特に、最安価格のSKU（商品バリエーション）を選択する課題に取り組んでいただきます。操作中、画面遷移、クリック、選択などの操作ログが自動的に記録されます。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>所要時間:</strong><br />
                約10〜20分程度を想定しています。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>想定される負荷やリスク:</strong><br />
                本実験では、心理的負荷（迷いやすいUIを使用することによる軽度のストレス）が発生する可能性があります。ただし、実験は任意参加であり、いつでも中断・退出することが可能です。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>収集するデータの種類:</strong><br />
                操作ログ（画面遷移、クリック、選択データ）、操作時間、選択した商品・SKU情報などを収集します。これらのデータは完全に匿名で収集され、個人を特定する情報は一切取得しません。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>個人情報の取り扱い:</strong><br />
                本実験では、氏名、住所、電話番号、メールアドレスなど、個人を特定する情報は一切取得しません。収集されるデータは完全に匿名化されます。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>データの利用目的:</strong><br />
                収集したデータは学術研究目的のみに使用され、第三者に提供されることはありません。研究結果は学術論文や学会発表で使用される可能性がありますが、個人を特定できる形で公開されることはありません。
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>実験の中断について:</strong><br />
                実験中、いつでも中断・退出することが可能です。途中でやめても不利益を受けることは一切ありません。
              </p>
              <p style={{ marginBottom: '0' }}>
                <strong>質問や懸念への対応:</strong><br />
                実験に関する質問や懸念がある場合は、以下の連絡先までお気軽にお問い合わせください。
              </p>
            </div>
          </div>

          {/* 2. 同意に必要なチェック項目 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              同意に必要なチェック項目（すべて必須）
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {CONSENT_CHECKS.map((text, index) => (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                    backgroundColor: formData.consentChecks[index] ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.consentChecks[index]) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.consentChecks[index]) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.consentChecks[index]}
                    onChange={() => handleCheckboxChange(index)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  />
                  <span style={{
                    color: '#000',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. リスク・不利益の理解確認 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              リスク・不利益の理解確認
            </h3>
            <p style={{
              color: '#000',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              本実験では、心理的負荷（迷いやすいUIを使用することによる軽度のストレス）が発生する可能性があります。この点を理解しましたか？
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, riskUnderstanding: 'はい' }))}
                style={{
                  padding: '14px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  border: formData.riskUnderstanding === 'はい' ? '3px solid #00b894' : '3px solid #00b894',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: formData.riskUnderstanding === 'はい'
                    ? 'linear-gradient(135deg, #00b894, #00cec9)'
                    : '#ffffff',
                  color: formData.riskUnderstanding === 'はい' ? '#ffffff' : '#00b894',
                  boxShadow: formData.riskUnderstanding === 'はい'
                    ? '0 4px 15px rgba(0, 184, 148, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transform: formData.riskUnderstanding === 'はい' ? 'scale(1.05)' : 'scale(1)',
                  minWidth: '120px'
                }}
              >
                ✓ はい
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, riskUnderstanding: 'いいえ' }))}
                style={{
                  padding: '14px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  border: formData.riskUnderstanding === 'いいえ' ? '3px solid #f5576c' : '3px solid #f5576c',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: formData.riskUnderstanding === 'いいえ'
                    ? 'linear-gradient(135deg, #f5576c, #f093fb)'
                    : '#ffffff',
                  color: formData.riskUnderstanding === 'いいえ' ? '#ffffff' : '#f5576c',
                  boxShadow: formData.riskUnderstanding === 'いいえ'
                    ? '0 4px 15px rgba(245, 87, 108, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)',
                  transform: formData.riskUnderstanding === 'いいえ' ? 'scale(1.05)' : 'scale(1)',
                  minWidth: '120px'
                }}
              >
                ✗ いいえ
              </button>
            </div>
            {formData.riskUnderstanding === 'いいえ' && (
              <p style={{
                color: '#f5576c',
                fontSize: '0.9rem',
                marginTop: '15px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ※ 実験に参加するには「はい」を選択する必要があります。
              </p>
            )}
          </div>

          {/* 4. 参加者の基本情報 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              参加者の基本情報
            </h3>
            
            {/* ECサイト利用頻度 */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                ECサイト利用頻度 <span style={{ color: '#f5576c' }}>*</span>
              </label>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {EC_USAGE_FREQUENCY_OPTIONS.map((option) => (
                  <label
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      backgroundColor: formData.ecUsageFrequency === option ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.ecUsageFrequency !== option) {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.ecUsageFrequency !== option) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="ecUsageFrequency"
                      value={option}
                      checked={formData.ecUsageFrequency === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, ecUsageFrequency: e.target.value }))}
                      required
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      color: '#000',
                      fontSize: '1rem'
                    }}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 本名（任意） */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                本名 <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 'normal' }}>（任意）</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="本名を入力（任意項目です）"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.border = '2px solid #667eea'}
                onBlur={(e) => e.currentTarget.style.border = '2px solid rgba(0, 0, 0, 0.2)'}
              />
              <p style={{
                color: '#666',
                fontSize: '0.85rem',
                marginTop: '8px',
                lineHeight: '1.5'
              }}>
                本名は任意項目です。入力しなくても実験に参加できます。
              </p>
            </div>

            {/* 視力・色覚（任意） */}
            <div>
              <label style={{
                display: 'block',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                視力・色覚の自己申告（補正後で良い） <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 'normal' }}>（任意）</span>
              </label>
              <input
                type="text"
                value={formData.vision}
                onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                placeholder="例：両眼1.0、色覚正常"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.border = '2px solid #667eea'}
                onBlur={(e) => e.currentTarget.style.border = '2px solid rgba(0, 0, 0, 0.2)'}
              />
            </div>
          </div>

          {/* 5. 実験参加の最終同意 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              実験参加の最終同意
            </h3>
            <p style={{
              color: '#000',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              私は、本研究の説明を読み、上記内容に同意し、参加します。
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '15px 30px',
                borderRadius: '30px',
                border: formData.finalConsent === '同意する' ? '3px solid #00b894' : '3px solid #00b894',
                background: formData.finalConsent === '同意する'
                  ? 'linear-gradient(135deg, #00b894, #00cec9)'
                  : '#ffffff',
                color: formData.finalConsent === '同意する' ? '#ffffff' : '#00b894',
                transition: 'all 0.3s ease',
                boxShadow: formData.finalConsent === '同意する'
                  ? '0 4px 15px rgba(0, 184, 148, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.15)',
                transform: formData.finalConsent === '同意する' ? 'scale(1.05)' : 'scale(1)',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                <input
                  type="radio"
                  name="finalConsent"
                  value="同意する"
                  checked={formData.finalConsent === '同意する'}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalConsent: e.target.value }))}
                  required
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                同意する
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '15px 30px',
                borderRadius: '30px',
                border: formData.finalConsent === '同意しない' ? '3px solid #f5576c' : '3px solid #f5576c',
                background: formData.finalConsent === '同意しない'
                  ? 'linear-gradient(135deg, #f5576c, #f093fb)'
                  : '#ffffff',
                color: formData.finalConsent === '同意しない' ? '#ffffff' : '#f5576c',
                transition: 'all 0.3s ease',
                boxShadow: formData.finalConsent === '同意しない'
                  ? '0 4px 15px rgba(245, 87, 108, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.15)',
                transform: formData.finalConsent === '同意しない' ? 'scale(1.05)' : 'scale(1)',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                <input
                  type="radio"
                  name="finalConsent"
                  value="同意しない"
                  checked={formData.finalConsent === '同意しない'}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalConsent: e.target.value }))}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                同意しない
              </label>
            </div>
            {formData.finalConsent === '同意しない' && (
              <p style={{
                color: '#f5576c',
                fontSize: '0.9rem',
                marginTop: '15px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ※ 「同意しない」を選択した場合、実験に参加することはできません。
              </p>
            )}
            <p style={{
              color: '#000',
              fontSize: '0.9rem',
              marginTop: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              padding: '15px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '8px'
            }}>
              全ての項目に同意した場合にのみ実験に参加することができます。
            </p>
          </div>

          {/* 6. 連絡先の表示 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '20px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '10px'
            }}>
              連絡先
            </h3>
            <div style={{
              color: '#000',
              fontSize: '1rem',
              lineHeight: '1.8'
            }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>研究代表者名:</strong> 後藤瞭介
              </p>
              <p>
                <strong>メールアドレス:</strong> b1022249@fun.ac.jp
              </p>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div style={{
              background: 'rgba(245, 87, 108, 0.1)',
              border: '2px solid #f5576c',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              color: '#f5576c',
              fontSize: '1rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px'
          }}>
            <button
              type="submit"
              disabled={loading || formData.finalConsent === '同意しない'}
              style={{
                padding: '15px 50px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '30px',
                border: 'none',
                cursor: (loading || formData.finalConsent === '同意しない') ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: (loading || formData.finalConsent === '同意しない')
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: (loading || formData.finalConsent === '同意しない')
                  ? 'none'
                  : '0 8px 25px rgba(102, 126, 234, 0.4)',
                opacity: (loading || formData.finalConsent === '同意しない') ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && formData.finalConsent !== '同意しない') {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && formData.finalConsent !== '同意しない') {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              {loading ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  )
}

