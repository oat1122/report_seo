export interface AiOverviewImage {
  id: string
  imageUrl: string
  createdAt: Date
  aiOverviewId: string
}

export interface AiOverview {
  id: string
  title: string
  displayDate: Date
  createdAt: Date
  customerId: string
  images: AiOverviewImage[]
}

export interface SerializedAiOverviewImage {
  id: string
  imageUrl: string
  createdAt: string
  aiOverviewId: string
}

export interface SerializedAiOverview {
  id: string
  title: string
  displayDate: string
  createdAt: string
  customerId: string
  images: SerializedAiOverviewImage[]
}

export function serializeAiOverview(row: AiOverview): SerializedAiOverview {
  return {
    ...row,
    displayDate: row.displayDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    images: row.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
  }
}
