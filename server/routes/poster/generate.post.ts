/**
 * POST /api/poster/generate
 *
 * Server-side poster generation fallback.
 * Called when client-side Canvas rendering fails.
 * Receives poster template type and data, returns generated image URL.
 *
 * Request body: { template: string, data: Record<string, any> }
 * Response: { code: 0, data: { imageUrl: string }, message: string }
 */

export interface PosterGenerateRequest {
  template: 'product' | 'post' | 'invite'
  data: Record<string, any>
}

export interface PosterGenerateResponse {
  code: number
  data: {
    imageUrl: string
  }
  message: string
}

export async function handler(request: PosterGenerateRequest): Promise<PosterGenerateResponse> {
  const { template, data } = request

  try {
    const imageUrl = await generatePoster(template, data)
    return {
      code: 0,
      data: { imageUrl },
      message: 'ok'
    }
  } catch (err) {
    console.error('Poster generation failed:', err)
    return {
      code: -1,
      data: { imageUrl: '' },
      message: err instanceof Error ? err.message : 'poster generation failed'
    }
  }
}

async function generatePoster(template: string, data: Record<string, any>): Promise<string> {
  // In production, use a server-side image rendering library (e.g., sharp, puppeteer, or cloud service)
  // For now, return a placeholder that directs to the preview page
  const params = new URLSearchParams({
    template,
    ...(data.title ? { title: String(data.title).slice(0, 40) } : {}),
    ...(data.image ? { image: String(data.image) } : {}),
    ...(data.code ? { code: String(data.code) } : {})
  })

  return `/pages/poster/preview/index?${params.toString()}`
}

export default handler
