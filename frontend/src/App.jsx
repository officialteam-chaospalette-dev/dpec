import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import Survey from './pages/Survey'
import ConsentForm from './pages/ConsentForm'
import ConsentRejected from './pages/ConsentRejected'
import UIBuilder from './pages/UIBuilder'
import FigmaHost from './components/FigmaHost'
import PageTransition from './components/PageTransition'
import Header from './components/Header'
import Footer from './components/Footer'
import { CartProvider } from './contexts/CartContext'
import { LoggingProvider } from './contexts/LoggingContext'
import { PatternProvider } from './contexts/PatternContext'
import './styles/global.css'

function AppContent() {
  const location = useLocation()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景アニメーション */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/products" element={<ProductList/>} />
            <Route path="/products/:id" element={<ProductDetail/>} />
            <Route path="/cart" element={<Cart/>} />
            <Route path="/checkout" element={<Checkout/>} />
            <Route path="/survey" element={<Survey/>} />
            <Route path="/consent" element={<ConsentForm/>} />
            <Route path="/consent-rejected" element={<ConsentRejected/>} />
            <Route path="/ui-builder" element={<UIBuilder/>} />
          </Routes>
        </main>

        <Footer />
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
      `}</style>
    </div>
  )
}

export default function App(){
  return (
    <PatternProvider>
      <LoggingProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </LoggingProvider>
    </PatternProvider>
  )
}
