import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // ページが変更された時のアニメーション
    setIsExiting(true)
    
    const timer = setTimeout(() => {
      setIsVisible(true)
      setIsExiting(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    // 初回表示時のアニメーション
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateY(0) scale(1)' 
          : isExiting 
            ? 'translateY(-20px) scale(0.95)' 
            : 'translateY(20px) scale(0.95)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'center top',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 背景グラデーション効果 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isVisible 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
          transition: 'all 0.4s ease',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      
      {/* コンテンツ */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: isVisible 
            ? '0 20px 40px rgba(0,0,0,0.1)' 
            : '0 5px 15px rgba(0,0,0,0.05)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          margin: '20px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PageTransition
