import { Component } from 'react'

// Per-page error boundary — catches any render crash
export class SafePage extends Component<{ children: React.ReactNode; name?: string }, { error: Error | null }> {
  constructor(props: any) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error: Error) { return { error } }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', fontSize: 14 }}>⚠️ 页面加载出错</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} className="btn btn-sm mt-3">重试</button>
        </div>
      )
    }
    return this.props.children
  }
}

// Safety wrapper for String.repeat and similar operations
export function safeRepeat(char: string, count: number): string {
  const n = Math.max(0, Math.min(Math.round(count), 100))
  return char.repeat(n)
}

// Safety wrapper for Array rendering
export function safeLimit<T>(arr: T[] | undefined | null, max: number): T[] {
  if (!Array.isArray(arr)) return []
  return arr.slice(0, max)
}
