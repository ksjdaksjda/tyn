// DeepSeek AI client — OpenAI-compatible, user brings their own key
import OpenAI from 'openai'

export function getDeepSeekKey(): string | null {
  return localStorage.getItem('deepseek-api-key') || null
}

export function createDeepSeekClient(apiKey?: string): OpenAI | null {
  const key = apiKey || getDeepSeekKey()
  if (!key) return null

  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: key,
    dangerouslyAllowBrowser: true,
  })
}

export async function polishReview(content: string, apiKey?: string): Promise<string> {
  const client = createDeepSeekClient(apiKey)
  if (!client) throw new Error('请先在设置中配置 DeepSeek API Key')

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是一位专业的影评编辑。请帮用户润色影评，保持原意但使文字更流畅、更有深度。不要改变用户的核心观点。',
      },
      { role: 'user', content: `请润色以下影评：\n\n${content}` },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  return response.choices[0]?.message?.content || content
}

export async function suggestTags(reviewContent: string, apiKey?: string): Promise<string[]> {
  const client = createDeepSeekClient(apiKey)
  if (!client) throw new Error('请先在设置中配置 DeepSeek API Key')

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '根据影评内容，推荐3-5个标签（如"催泪""反转""治愈""悬疑""视觉盛宴"等）。只返回标签名，用逗号分隔。',
      },
      { role: 'user', content: reviewContent },
    ],
    temperature: 0.5,
    max_tokens: 100,
  })

  const text = response.choices[0]?.message?.content || ''
  return text.split(/[,，、]/).map(t => t.trim()).filter(Boolean)
}

export async function recommendMovies(
  watchedList: { title: string; rating: number; genres: string[] }[],
  apiKey?: string,
): Promise<string> {
  const client = createDeepSeekClient(apiKey)
  if (!client) throw new Error('请先在设置中配置 DeepSeek API Key')

  const watched = watchedList.map(m => `${m.title}(${m.genres.join('/')}，评分:${m.rating})`).join('\n')

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是一位电影推荐专家。根据用户的观影记录，推荐3-5部他可能喜欢的电影，简要说明理由。',
      },
      { role: 'user', content: `我看过这些作品：\n${watched}\n\n请推荐我下一部该看什么？` },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || '暂时无法生成推荐'
}

export async function chatWithAI(
  message: string,
  context: string,
  apiKey?: string,
): Promise<string> {
  const client = createDeepSeekClient(apiKey)
  if (!client) throw new Error('请先在设置中配置 DeepSeek API Key')

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `你是树洞影评助手的AI，帮助用户管理他们的影视和书籍收藏。当前用户数据：${context}`,
      },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  })

  return response.choices[0]?.message?.content || '抱歉，我无法回答这个问题。'
}
