// lib/posts.ts
import { supabase } from './libs/supabase'
import { Database } from './libs/supabase.type'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']

export const postsRepository = {
    async getAll(): Promise<Post[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async create(post: Omit<PostInsert, 'user_id'>): Promise<Post> {
        const { data: { session } } = await supabase.auth.getSession()

        const { data, error } = await supabase
            .from('posts')
            .insert({ ...post, user_id: session!.user.id })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}