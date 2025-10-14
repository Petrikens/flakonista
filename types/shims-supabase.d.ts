declare module '#supabase/server' {
  export const serverSupabaseClient: (event: any) => Promise<any>
}
