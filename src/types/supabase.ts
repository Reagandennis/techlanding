export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: UserRole
          first_name: string | null
          last_name: string | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          timezone: string | null
          language: string | null
          total_points: number
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          email_notifications: boolean
          push_notifications: boolean
          marketing_emails: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          timezone?: string | null
          language?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: UserRole
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          timezone?: string | null
          language?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          short_description: string | null
          thumbnail: string | null
          trailer_video: string | null
          price: number
          discount_price: number | null
          currency: string
          status: string
          published: boolean
          published_at: string | null
          level: string
          duration: number | null
          language: string
          instructor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          short_description?: string | null
          thumbnail?: string | null
          trailer_video?: string | null
          price?: number
          discount_price?: number | null
          currency?: string
          status?: string
          published?: boolean
          published_at?: string | null
          level?: string
          duration?: number | null
          language?: string
          instructor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          short_description?: string | null
          thumbnail?: string | null
          trailer_video?: string | null
          price?: number
          discount_price?: number | null
          currency?: string
          status?: string
          published?: boolean
          published_at?: string | null
          level?: string
          duration?: number | null
          language?: string
          instructor_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: string
          progress: number
          enrolled_at: string
          completed_at: string | null
          payment_status: string
          payment_amount: number | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: string
          progress?: number
          enrolled_at?: string
          completed_at?: string | null
          payment_status?: string
          payment_amount?: number | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: string
          progress?: number
          enrolled_at?: string
          completed_at?: string | null
          payment_status?: string
          payment_amount?: number | null
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']