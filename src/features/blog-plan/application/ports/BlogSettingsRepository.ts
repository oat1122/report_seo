export interface BlogSettings {
  articlesPerMonth: number
  blogWriterId: string | null
  blogWriterName: string | null
}

export interface BlogSettingsPatch {
  articlesPerMonth?: number
  blogWriterId?: string | null
}

export interface BlogSettingsRepository {
  get(customerId: string): Promise<BlogSettings | null>
  update(customerId: string, patch: BlogSettingsPatch): Promise<BlogSettings>
  /** ตรวจว่า user ที่จะ assign เป็น BLOG_WRITER จริง — กันตั้ง role อื่นเป็น writer */
  isBlogWriter(userId: string): Promise<boolean>
}
