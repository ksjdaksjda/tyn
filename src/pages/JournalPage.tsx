import JournalCanvas from '@/components/journal/JournalCanvas'

export default function JournalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--text)]">📒 手帐</h1>
      <JournalCanvas />
    </div>
  )
}
