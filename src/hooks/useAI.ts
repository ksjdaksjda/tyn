import { useState, useCallback } from 'react'
import { polishReview, suggestTags, recommendMovies, chatWithAI, getDeepSeekKey } from '@/lib/deepseek'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasKey = !!getDeepSeekKey()

  const polish = useCallback(async (content: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await polishReview(content)
      return result
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const generateTags = useCallback(async (content: string) => {
    setLoading(true)
    setError(null)
    try {
      return await suggestTags(content)
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const recommend = useCallback(async (
    watched: { title: string; rating: number; genres: string[] }[],
  ) => {
    setLoading(true)
    setError(null)
    try {
      return await recommendMovies(watched)
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const chat = useCallback(async (message: string, context: string) => {
    setLoading(true)
    setError(null)
    try {
      return await chatWithAI(message, context)
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { polish, generateTags, recommend, chat, loading, error, hasKey }
}
