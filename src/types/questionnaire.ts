export interface PendingQuestionnaire {
  id: string
  campaignId: string
  title: string
  condition: "BEFORE" | "AFTER" | "DAILY" | "EVERY_X_DAYS"
  frequencyInDays: number | null
  questionnaireData: any
  createdAt: string
  updatedAt: string
  reason: string
}
