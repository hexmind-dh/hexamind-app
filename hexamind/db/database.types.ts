/**
 * Supabase 数据库类型定义
 *
 * 对应 Prisma schema: server-prisma/prisma/schema.prisma
 *
 * 注意：
 * - profiles.id 来自 auth.users（FK 由 raw SQL 创建，Prisma 不管理）
 * - 业务表通过 user_id 关联到 profiles.id
 * - daily_query_stats 为视图，由 raw SQL 创建
 */

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
      // ============================================
      // profiles — 用户资料（id 来自 auth.users）
      // ============================================
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          provider: string | null
          tier: 'Free' | 'Pro'
          daily_query_count: number
          daily_query_date: string | null
          last_query_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          provider?: string | null
          tier?: 'Free' | 'Pro'
          daily_query_count?: number
          daily_query_date?: string | null
          last_query_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          provider?: string | null
          tier?: 'Free' | 'Pro'
          daily_query_count?: number
          daily_query_date?: string | null
          last_query_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }

      // ============================================
      // divinations — 占卜记录
      // ============================================
      divinations: {
        Row: {
          id: string
          user_id: string
          question: string
          language: string
          temporal_seed_raw: number
          temporal_seed_hex: string | null
          latitude: number
          longitude: number
          spatial_seed_formatted: string | null
          kinetic_seed_raw: number
          original_chart_name: string
          original_chart_english: string | null
          original_chart_symbol: string | null
          original_chart_lines: Json | null
          original_upper_trigram: Json | null
          original_lower_trigram: Json | null
          nuclear_chart_name: string | null
          nuclear_chart_english: string | null
          nuclear_chart_symbol: string | null
          nuclear_chart_lines: Json | null
          nuclear_upper_trigram: Json | null
          nuclear_lower_trigram: Json | null
          transformed_chart_name: string | null
          transformed_chart_english: string | null
          transformed_chart_symbol: string | null
          transformed_chart_lines: Json | null
          transformed_upper_trigram: Json | null
          transformed_lower_trigram: Json | null
          changing_line: number
          ti_gua_role: string
          ti_trigram_id: number
          ti_trigram_name: string | null
          ti_element: string | null
          yong_gua_role: string
          yong_trigram_id: number
          yong_trigram_name: string | null
          yong_element: string | null
          relationship_type: string
          relationship_conclusion: string
          relationship_auspiciousness: string
          relationship_chinese_interpretation: string | null
          confidence_score: number | null
          ai_verdict: string | null
          ai_analysis: string | null
          ai_tactical_actions: Json | null
          ai_phenomenological_echo: string | null
          ai_catalyst_window: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          question: string
          language?: string
          temporal_seed_raw: number
          temporal_seed_hex?: string | null
          latitude?: number
          longitude?: number
          spatial_seed_formatted?: string | null
          kinetic_seed_raw?: number
          original_chart_name: string
          original_chart_english?: string | null
          original_chart_symbol?: string | null
          original_chart_lines?: Json | null
          original_upper_trigram?: Json | null
          original_lower_trigram?: Json | null
          nuclear_chart_name?: string | null
          nuclear_chart_english?: string | null
          nuclear_chart_symbol?: string | null
          nuclear_chart_lines?: Json | null
          nuclear_upper_trigram?: Json | null
          nuclear_lower_trigram?: Json | null
          transformed_chart_name?: string | null
          transformed_chart_english?: string | null
          transformed_chart_symbol?: string | null
          transformed_chart_lines?: Json | null
          transformed_upper_trigram?: Json | null
          transformed_lower_trigram?: Json | null
          changing_line: number
          ti_gua_role: string
          ti_trigram_id: number
          ti_trigram_name?: string | null
          ti_element?: string | null
          yong_gua_role: string
          yong_trigram_id: number
          yong_trigram_name?: string | null
          yong_element?: string | null
          relationship_type: string
          relationship_conclusion: string
          relationship_auspiciousness: string
          relationship_chinese_interpretation?: string | null
          confidence_score?: number | null
          ai_verdict?: string | null
          ai_analysis?: string | null
          ai_tactical_actions?: Json | null
          ai_phenomenological_echo?: string | null
          ai_catalyst_window?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question?: string
          language?: string
          temporal_seed_raw?: number
          temporal_seed_hex?: string | null
          latitude?: number
          longitude?: number
          spatial_seed_formatted?: string | null
          kinetic_seed_raw?: number
          original_chart_name?: string
          original_chart_english?: string | null
          original_chart_symbol?: string | null
          original_chart_lines?: Json | null
          original_upper_trigram?: Json | null
          original_lower_trigram?: Json | null
          nuclear_chart_name?: string | null
          nuclear_chart_english?: string | null
          nuclear_chart_symbol?: string | null
          nuclear_chart_lines?: Json | null
          nuclear_upper_trigram?: Json | null
          nuclear_lower_trigram?: Json | null
          transformed_chart_name?: string | null
          transformed_chart_english?: string | null
          transformed_chart_symbol?: string | null
          transformed_chart_lines?: Json | null
          transformed_upper_trigram?: Json | null
          transformed_lower_trigram?: Json | null
          changing_line?: number
          ti_gua_role?: string
          ti_trigram_id?: number
          ti_trigram_name?: string | null
          ti_element?: string | null
          yong_gua_role?: string
          yong_trigram_id?: number
          yong_trigram_name?: string | null
          yong_element?: string | null
          relationship_type?: string
          relationship_conclusion?: string
          relationship_auspiciousness?: string
          relationship_chinese_interpretation?: string | null
          confidence_score?: number | null
          ai_verdict?: string | null
          ai_analysis?: string | null
          ai_tactical_actions?: Json | null
          ai_phenomenological_echo?: string | null
          ai_catalyst_window?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'divinations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ============================================
      // chat_messages — AI 聊天记录
      // ============================================
      chat_messages: {
        Row: {
          id: string
          divination_id: string
          user_id: string
          role: 'user' | 'model'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          divination_id: string
          user_id: string
          role: 'user' | 'model'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          divination_id?: string
          user_id?: string
          role?: 'user' | 'model'
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_messages_divination_id_fkey'
            columns: ['divination_id']
            isOneToOne: false
            referencedRelation: 'divinations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_messages_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ============================================
      // subscriptions — 订阅记录（Stripe 预留）
      // ============================================
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'Free' | 'Pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'active' | 'canceled' | 'expired' | 'trialing'
          trial_ends_at: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier?: 'Free' | 'Pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'canceled' | 'expired' | 'trialing'
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'Free' | 'Pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'canceled' | 'expired' | 'trialing'
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      // ============================================
      // llm_providers — LLM 提供商配置（管理后台）
      // ============================================
      llm_providers: {
        Row: {
          id: string
          name: string
          api_key: string
          base_url: string | null
          model: string
          is_active: boolean
          max_tokens: number | null
          temperature: number | null
          config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          api_key: string
          base_url?: string | null
          model: string
          is_active?: boolean
          max_tokens?: number | null
          temperature?: number | null
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          api_key?: string
          base_url?: string | null
          model?: string
          is_active?: boolean
          max_tokens?: number | null
          temperature?: number | null
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }

    // ============================================
    // Views
    // ============================================
    Views: {
      daily_query_stats: {
        Row: {
          user_id: string | null
          tier: string | null
          daily_query_count: number | null
          daily_query_date: string | null
          last_query_at: string | null
          daily_limit: number | null
        }
        Relationships: []
      }
    }

    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
