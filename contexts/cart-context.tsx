"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type CartItem = {
  title: string
  description: string
  price: string
  points?: number
  aedPrice?: number
  serviceType?: 'basic' | 'elite' | 'virtual-rm'
  category?: 'rm-service' | 'other'
  paymentMethod?: 'points' | 'aed' | 'hybrid'
  hybridPayment?: {
    pointsToUse: number
    aedAmount: number
    totalPointsRequired: number
  }
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (title: string) => void
  isInCart: (title: string) => boolean
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setCart((prev) => (prev.find((i) => i.title === item.title) ? prev : [...prev, item]))
  }

  const removeFromCart = (title: string) => {
    setCart((prev) => prev.filter((item) => item.title !== title))
  }

  const isInCart = (title: string) => {
    return cart.some((item) => item.title === title)
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
} 