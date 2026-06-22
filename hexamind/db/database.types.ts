export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            llm_providers: {
                Row: {
                    id: string
                    api_key: string
                    base_url: string | null
                    model: string
                    is_active: boolean
                    max_tokens: number | null
                    temperature: number | null
                    config: Json | null
                    created_at: string
                    updated_at: string
                    name: string
                }
                Insert: {
                    id?: string
                    api_key: string
                    base_url?: string | null
                    model: string
                    is_active?: boolean
                    max_tokens?: number | null
                    temperature?: number | null
                    config?: Json | null
                    created_at?: string
                    updated_at?: string
                    name: string
                }
                Update: {
                    id?: string
                    api_key?: string
                    base_url?: string | null
                    model?: string
                    is_active?: boolean
                    max_tokens?: number | null
                    temperature?: number | null
                    config?: Json | null
                    created_at?: string
                    updated_at?: string
                    name?: string
                }
                Relationships: []
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}
