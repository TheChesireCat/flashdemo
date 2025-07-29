export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          deck_id: string
          user_id: string
          front: string
          back: string
          front_language: string | null
          back_language: string | null
          created_at: string
          last_reviewed: string | null
          next_review: string
          interval: number
          repetition: number
          efactor: number
          updated_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          user_id: string
          front: string
          back: string
          front_language?: string | null
          back_language?: string | null
          created_at?: string
          last_reviewed?: string | null
          next_review: string
          interval?: number
          repetition?: number
          efactor?: number
          updated_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          user_id?: string
          front?: string
          back?: string
          front_language?: string | null
          back_language?: string | null
          created_at?: string
          last_reviewed?: string | null
          next_review?: string
          interval?: number
          repetition?: number
          efactor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      review_sessions: {
        Row: {
          id: string
          user_id: string
          deck_id: string | null
          session_type: string
          cards_reviewed: number
          correct_answers: number
          session_start: string
          session_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deck_id?: string | null
          session_type: string
          cards_reviewed?: number
          correct_answers?: number
          session_start?: string
          session_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deck_id?: string | null
          session_type?: string
          cards_reviewed?: number
          correct_answers?: number
          session_start?: string
          session_end?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 