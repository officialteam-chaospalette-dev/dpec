import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

// 30個の質問項目
const QUESTIONS = [
  { id: 1, text: '人の体験談を聞いているとき，私はときどきその状況を生き生きと想像している自分に気づくことがある', category: 'visualizer' },
  { id: 2, text: '日常生活のなかで，いつも映像的なイメージが浮かんでいる', category: 'visualizer' },
  { id: 3, text: '小説を読んでいるときには，私はいつもそこに描かれている部屋や情景についてはっきりとしたイメージを細部にわたって思い浮かべる', category: 'visualizer' },
  { id: 4, text: '写真のように鮮明な記憶を持っている', category: 'visualizer' },
  { id: 5, text: '映像的なイメージを思い浮かべながら本を読むことが多い', category: 'visualizer' },
  { id: 6, text: '私のイメージは非常に鮮明で写真のようだ', category: 'visualizer' },
  { id: 7, text: 'ラジオのアナウンサーやDJが話すのを聞いているとき，いつもその情景や様子を具体的に思い描いている自分に気づく', category: 'visualizer' },
  { id: 8, text: '考え事をするとき，絵や映像的なイメージを使うことが多い', category: 'visualizer' },
  { id: 9, text: '一度見た絵画や写真，テレビや映画などのイメージがいつまでも頭の中に残っている', category: 'visualizer' },
  { id: 10, text: '目を閉じると過去に経験した光景を容易に思い出すことができる', category: 'visualizer' },
  { id: 11, text: '文章を書くとき，適当な言葉が次々に浮かんでくる', category: 'verbalizer' },
  { id: 12, text: '文章で自分の気持ちを相手にうまく伝えることができる', category: 'verbalizer' },
  { id: 13, text: '意味が似ている言葉を次々に思い浮かべることができる', category: 'verbalizer' },
  { id: 14, text: '単語の同音異義語（移動と異動など）をすぐに思いつく', category: 'verbalizer' },
  { id: 15, text: 'ある言葉の反対の意味の言葉（高い⇔低い）を聞かれてもすぐに答えられる', category: 'verbalizer' },
  { id: 16, text: '難しい文章でも比較的速く読める', category: 'verbalizer' },
  { id: 17, text: '自分が話す内容の要点を抑えながら会話できる', category: 'verbalizer' },
  { id: 18, text: '文字や言葉を使う仕事は楽しいと思う', category: 'verbalizer' },
  { id: 19, text: '漢字を覚えるのは得意だ', category: 'verbalizer' },
  { id: 20, text: '文章のちょっとした誤りによく気がつく', category: 'verbalizer' },
  { id: 21, text: '地図を見ると自分がいる場所をすぐに見つけることができる', category: 'spatial' },
  { id: 22, text: '頭の中で立体の図形を簡単にイメージしたり，回転させたりすることができる', category: 'spatial' },
  { id: 23, text: '言葉で目的地までの行き方を教えてもらえば，目的地までの正しい道筋がわかる', category: 'spatial' },
  { id: 24, text: '道を曲がるところでいちいち目印を確認しなくても目的地に行ける', category: 'spatial' },
  { id: 25, text: '3次元的な立体図形を回転させたときに，その図形がどのような形に見えるかイメージすることができる', category: 'spatial' },
  { id: 26, text: '3次元的な立体図形を描くのが得意である', category: 'spatial' },
  { id: 27, text: '車で右折左折を繰り返して目的地に着いたとき，帰り道はどこでどう曲がったらよいかわからなくなる', category: 'spatial' },
  { id: 28, text: 'よく行く場所で道に迷ったり，間違った方向に行く', category: 'spatial' },
  { id: 29, text: 'ホテルや旅館の部屋に入るとその部屋がどちら向きの部屋になっているのかわからなくなる', category: 'spatial' },
  { id: 30, text: '建物の見取り図や平面図を書くのが得意である', category: 'spatial' },
]

export default function Survey() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  // ページを開くたびに質問をランダムに並び替え
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setAnswers({})
    setResult(null)
  }, [])

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleComplete = () => {
    // すべての質問に回答しているか確認
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert('すべての質問に回答してください。')
      return
    }

    // 結果を生成（質問番号x1または質問番号x0の形式）
    const resultArray = QUESTIONS.map(q => {
      const answer = answers[q.id]
      return `${q.id}x${answer ? 1 : 0}`
    })
    
    const resultString = resultArray.join(' ')
    setResult(resultString)
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
          認知スタイルアンケート
        </h2>

        {!result ? (
          <>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '30px',
              marginBottom: '30px',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{
                color: '#000',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}>
                以下の質問について、「はい」または「いいえ」でお答えください。
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '25px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    color: '#333',
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    質問 {index + 1} / {QUESTIONS.length}
                  </div>
                  <div style={{
                    color: '#000',
                    fontSize: '1.1rem',
                    marginBottom: '20px',
                    lineHeight: '1.6'
                  }}>
                    {question.text}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleAnswer(question.id, true)}
                      style={{
                        padding: '14px 40px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '30px',
                        border: answers[question.id] === true
                          ? '3px solid #00b894'
                          : '3px solid #00b894',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: answers[question.id] === true
                          ? 'linear-gradient(135deg, #00b894, #00cec9)'
                          : '#ffffff',
                        color: answers[question.id] === true ? '#ffffff' : '#00b894',
                        boxShadow: answers[question.id] === true
                          ? '0 4px 15px rgba(0, 184, 148, 0.4)'
                          : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transform: answers[question.id] === true ? 'scale(1.05)' : 'scale(1)',
                        minWidth: '120px'
                      }}
                      onMouseEnter={(e) => {
                        if (answers[question.id] !== true) {
                          e.currentTarget.style.background = '#f0fdf4'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[question.id] !== true) {
                          e.currentTarget.style.background = '#ffffff'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      ✓ はい
                    </button>
                    <button
                      onClick={() => handleAnswer(question.id, false)}
                      style={{
                        padding: '14px 40px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '30px',
                        border: answers[question.id] === false
                          ? '3px solid #f5576c'
                          : '3px solid #f5576c',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: answers[question.id] === false
                          ? 'linear-gradient(135deg, #f5576c, #f093fb)'
                          : '#ffffff',
                        color: answers[question.id] === false ? '#ffffff' : '#f5576c',
                        boxShadow: answers[question.id] === false
                          ? '0 4px 15px rgba(245, 87, 108, 0.4)'
                          : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transform: answers[question.id] === false ? 'scale(1.05)' : 'scale(1)',
                        minWidth: '120px'
                      }}
                      onMouseEnter={(e) => {
                        if (answers[question.id] !== false) {
                          e.currentTarget.style.background = '#fef2f2'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[question.id] !== false) {
                          e.currentTarget.style.background = '#ffffff'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      ✗ いいえ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '40px',
              textAlign: 'center'
            }}>
              <button
                onClick={handleComplete}
                disabled={Object.keys(answers).length !== QUESTIONS.length}
                style={{
                  padding: '15px 50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: Object.keys(answers).length === QUESTIONS.length ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  background: Object.keys(answers).length === QUESTIONS.length
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  boxShadow: Object.keys(answers).length === QUESTIONS.length
                    ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                    : 'none',
                  opacity: Object.keys(answers).length === QUESTIONS.length ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (Object.keys(answers).length === QUESTIONS.length) {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (Object.keys(answers).length === QUESTIONS.length) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                完了
              </button>
            </div>
          </>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#000',
              fontSize: '1.5rem',
              marginBottom: '20px'
            }}>
              アンケート結果
            </h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px',
              wordBreak: 'break-all'
            }}>
              <p style={{
                color: '#000',
                fontSize: '1rem',
                lineHeight: '1.8',
                fontFamily: 'monospace'
              }}>
                {result}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/products"
                style={{
                  background: 'linear-gradient(135deg, #00b894, #00cec9)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)',
                  display: 'inline-block'
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
                商品一覧に戻る
              </Link>
              <button
                onClick={() => {
                  setResult(null)
                  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
                  setQuestions(shuffled)
                  setAnswers({})
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                もう一度回答する
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

