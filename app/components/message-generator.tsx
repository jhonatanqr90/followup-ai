"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

const inputClass = 'w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out'
const textareaClass = 'w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out resize-y'
const buttonClass = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]'

export function MessageGenerator() {
  const { data: session, status } = useSession()
  const [amount, setAmount] = useState("")
  const [daysLate, setDaysLate] = useState("")
  const [tone, setTone] = useState("friendly")
  const [language, setLanguage] = useState("es")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          daysLate: Number(daysLate),
          tone,
          language,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        setError("No response stream available")
        setLoading(false)
        return
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setMessage((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <p>Loading...</p>

  if (session) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          className={inputClass}
          type="number"
          min={0}
          value={amount}
          placeholder="Amount"
          onInput={(e) => setAmount(e.currentTarget.value)}
        />
        <input
          className={inputClass}
          type="number"
          min={1}
          value={daysLate}
          placeholder="Days late"
          onInput={(e) => setDaysLate(e.currentTarget.value)}
        />
        <select className={inputClass} value={tone} onChange={(e) => setTone(e.currentTarget.value)}>
          <option value="friendly">Friendly</option>
          <option value="firm">Firm</option>
          <option value="urgent">Urgent</option>
        </select>
        <select className={inputClass} value={language} onChange={(e) => setLanguage(e.currentTarget.value)}>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <textarea className={textareaClass} value={message} readOnly rows={8} />
        <button className={buttonClass} type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate message"}
        </button>
      </form>
    )
  }

  return null
}