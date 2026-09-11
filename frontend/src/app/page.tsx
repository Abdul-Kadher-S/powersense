"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem("homeguard_token")
    if (token) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="animate-pulse text-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          HomeGuard AI
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  )
}
