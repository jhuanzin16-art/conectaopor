export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificate_templates: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string
          fields: Json
          file_type: string
          file_url: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string
          fields?: Json
          file_type?: string
          file_url?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string
          fields?: Json
          file_type?: string
          file_url?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          code: string
          course_id: string
          course_name: string
          hours: number
          id: string
          issued_at: string
          student_name: string
          user_id: string
        }
        Insert: {
          code: string
          course_id: string
          course_name: string
          hours?: number
          id?: string
          issued_at?: string
          student_name: string
          user_id: string
        }
        Update: {
          code?: string
          course_id?: string
          course_name?: string
          hours?: number
          id?: string
          issued_at?: string
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          name: string
          parent_id: string | null
          position: number
          scope: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name: string
          parent_id?: string | null
          position?: number
          scope?: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name?: string
          parent_id?: string | null
          position?: number
          scope?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          audience: string
          banner_url: string | null
          category_id: string | null
          certificate_template_id: string | null
          completion_rules: Json
          content_category_id: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          external_url: string | null
          featured: boolean
          hours: number
          id: string
          instructor: string
          is_external: boolean
          learning_outcomes: string[]
          level: Database["public"]["Enums"]["course_level"]
          objectives: string[]
          platform: string | null
          position: number
          prerequisites: string
          published_at: string | null
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          subcategory_id: string | null
          subtitle: string
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
          views_count: number
        }
        Insert: {
          audience?: string
          banner_url?: string | null
          category_id?: string | null
          certificate_template_id?: string | null
          completion_rules?: Json
          content_category_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          external_url?: string | null
          featured?: boolean
          hours?: number
          id?: string
          instructor?: string
          is_external?: boolean
          learning_outcomes?: string[]
          level?: Database["public"]["Enums"]["course_level"]
          objectives?: string[]
          platform?: string | null
          position?: number
          prerequisites?: string
          published_at?: string | null
          short_description?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          subcategory_id?: string | null
          subtitle?: string
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
          views_count?: number
        }
        Update: {
          audience?: string
          banner_url?: string | null
          category_id?: string | null
          certificate_template_id?: string | null
          completion_rules?: Json
          content_category_id?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          external_url?: string | null
          featured?: boolean
          hours?: number
          id?: string
          instructor?: string
          is_external?: boolean
          learning_outcomes?: string[]
          level?: Database["public"]["Enums"]["course_level"]
          objectives?: string[]
          platform?: string | null
          position?: number
          prerequisites?: string
          published_at?: string | null
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          subcategory_id?: string | null
          subtitle?: string
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_certificate_template_id_fkey"
            columns: ["certificate_template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_content_category_id_fkey"
            columns: ["content_category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          apply_url: string | null
          area: string
          benefits: string
          category_id: string | null
          company: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string
          featured: boolean
          id: string
          image_url: string | null
          location: string
          position: number
          published_at: string | null
          required_course: string
          requirements: string
          status: Database["public"]["Enums"]["content_status"]
          stipend: string
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
          weekly_hours: string
          work_model: string
        }
        Insert: {
          apply_url?: string | null
          area?: string
          benefits?: string
          category_id?: string | null
          company?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string
          position?: number
          published_at?: string | null
          required_course?: string
          requirements?: string
          status?: Database["public"]["Enums"]["content_status"]
          stipend?: string
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
          weekly_hours?: string
          work_model?: string
        }
        Update: {
          apply_url?: string | null
          area?: string
          benefits?: string
          category_id?: string | null
          company?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string
          position?: number
          published_at?: string | null
          required_course?: string
          requirements?: string
          status?: Database["public"]["Enums"]["content_status"]
          stipend?: string
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
          weekly_hours?: string
          work_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_openings: {
        Row: {
          apply_url: string | null
          area: string
          benefits: string
          category_id: string | null
          closed: boolean
          company: string
          contract_type: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string
          education: string
          featured: boolean
          id: string
          image_url: string | null
          location: string
          position: number
          published_at: string | null
          requirements: string
          salary: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
          work_model: string
        }
        Insert: {
          apply_url?: string | null
          area?: string
          benefits?: string
          category_id?: string | null
          closed?: boolean
          company?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          education?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string
          position?: number
          published_at?: string | null
          requirements?: string
          salary?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
          work_model?: string
        }
        Update: {
          apply_url?: string | null
          area?: string
          benefits?: string
          category_id?: string | null
          closed?: boolean
          company?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          education?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          location?: string
          position?: number
          published_at?: string | null
          requirements?: string
          salary?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
          work_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_openings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_blocks: {
        Row: {
          created_at: string
          data: Json
          id: string
          lesson_id: string
          position: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          lesson_id: string
          position?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          lesson_id?: string
          position?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_blocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string
          duration_min: number
          id: string
          module_id: string | null
          position: number
          required: boolean
          status: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string
          course_id: string
          created_at?: string
          duration_min?: number
          id?: string
          module_id?: string | null
          position?: number
          required?: boolean
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          duration_min?: number
          id?: string
          module_id?: string | null
          position?: number
          required?: boolean
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          mime_type: string
          name: string
          path: string
          size_bytes: number
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          mime_type?: string
          name: string
          path?: string
          size_bytes?: number
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          mime_type?: string
          name?: string
          path?: string
          size_bytes?: number
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ban_reason: string | null
          banned: boolean
          banned_at: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          ban_reason?: string | null
          banned?: boolean
          banned_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          ban_reason?: string | null
          banned?: boolean
          banned_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_exams: {
        Row: {
          category_id: string | null
          city: string
          created_at: string
          created_by: string | null
          description: string
          education: string
          exam_date: string | null
          featured: boolean
          id: string
          image_url: string | null
          notice_text: string
          notice_url: string | null
          organization: string
          position: number
          published_at: string | null
          registration_deadline: string | null
          registration_fee: string
          registration_url: string | null
          role: string
          salary: string
          situation: string
          state: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
          vacancies: string
        }
        Insert: {
          category_id?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string
          education?: string
          exam_date?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          notice_text?: string
          notice_url?: string | null
          organization?: string
          position?: number
          published_at?: string | null
          registration_deadline?: string | null
          registration_fee?: string
          registration_url?: string | null
          role?: string
          salary?: string
          situation?: string
          state?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
          vacancies?: string
        }
        Update: {
          category_id?: string | null
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string
          education?: string
          exam_date?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          notice_text?: string
          notice_url?: string | null
          organization?: string
          position?: number
          published_at?: string | null
          registration_deadline?: string | null
          registration_fee?: string
          registration_url?: string | null
          role?: string
          salary?: string
          situation?: string
          state?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
          vacancies?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation: string
          id: string
          options: Json
          points: number
          position: number
          question: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          correct_index?: number
          created_at?: string
          explanation?: string
          id?: string
          options?: Json
          points?: number
          position?: number
          question: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation?: string
          id?: string
          options?: Json
          points?: number
          position?: number
          question?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempts_allowed: number
          course_id: string
          created_at: string
          description: string
          id: string
          lesson_id: string | null
          min_score: number
          position: number
          required: boolean
          title: string
          updated_at: string
        }
        Insert: {
          attempts_allowed?: number
          course_id: string
          created_at?: string
          description?: string
          id?: string
          lesson_id?: string | null
          min_score?: number
          position?: number
          required?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          attempts_allowed?: number
          course_id?: string
          created_at?: string
          description?: string
          id?: string
          lesson_id?: string | null
          min_score?: number
          position?: number
          required?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string
          file_url: string | null
          id: string
          name: string
          position: number
          preview_url: string | null
          recommended: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_url?: string | null
          id?: string
          name: string
          position?: number
          preview_url?: string | null
          recommended?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          file_url?: string | null
          id?: string
          name?: string
          position?: number
          preview_url?: string | null
          recommended?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          course_id: string
          course_name: string
          created_at: string
          id: string
          instituicao: string | null
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          course_name: string
          created_at?: string
          id?: string
          instituicao?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          course_name?: string
          created_at?: string
          id?: string
          instituicao?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_stats: { Args: never; Returns: Json }
      can_manage_users: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_course_views: {
        Args: { _course_id: string }
        Returns: undefined
      }
      is_banned: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      issue_certificate: {
        Args: { _course_id: string }
        Returns: {
          code: string
          course_id: string
          course_name: string
          hours: number
          id: string
          issued_at: string
          student_name: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "certificates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          code: string
          course_name: string
          hours: number
          issued_at: string
          student_name: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      content_status: "rascunho" | "publicado" | "desativado" | "arquivado"
      course_level: "iniciante" | "intermediario" | "avancado"
      course_status: "salvo" | "iniciado" | "concluido"
      publish_status: "rascunho" | "publicado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "editor"],
      content_status: ["rascunho", "publicado", "desativado", "arquivado"],
      course_level: ["iniciante", "intermediario", "avancado"],
      course_status: ["salvo", "iniciado", "concluido"],
      publish_status: ["rascunho", "publicado"],
    },
  },
} as const
