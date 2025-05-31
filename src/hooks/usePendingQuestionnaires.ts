// hooks/usePendingQuestionnaires.ts
import { useEffect, useState } from "react"
import axios from "axios"
import { PendingQuestionnaire } from "@/types/questionnaire"

interface UsePendingQuestionnairesResult {
  pending: PendingQuestionnaire[]
  loading: boolean
  error: string | null
}

export function usePendingQuestionnaires(
  campaignId?: string
): UsePendingQuestionnairesResult {
  const [pending, setPending] = useState<PendingQuestionnaire[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) return

    const fetchPending = async () => {
      setLoading(true)
      try {
        const res = await axios.get(
          `/api/questionnaires/pending?campaignId=${campaignId}`
        )
        setPending(res.data.pending)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch questionnaires.")
      } finally {
        setLoading(false)
      }
    }

    fetchPending()
  }, [campaignId])

  return { pending, loading, error }
}
