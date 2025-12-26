
/**
 * Supabase PostgREST API Service
 * 已注入用户提供的生产环境凭据
 */

const CONFIG = {
  // 你的 Project URL
  url: 'https://pjlqwtquteaosulpvfps.supabase.co',
  // 你的 anon public Key (JWT)
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbHF3dHF1dGVhb3N1bHB2ZnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzE2MTQsImV4cCI6MjA4MjMwNzYxNH0.0OUB5-kFvEJkGDpExHIu80BzIDCtUsijbV_Ik2Nk7jg',
  table: 'registrations',
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': CONFIG.apiKey,
  'Authorization': `Bearer ${CONFIG.apiKey}`,
});

export const dbService = {
  getDiagnostics() {
    const issues = [];
    if (!CONFIG.url || CONFIG.url.includes('your-project')) issues.push("缺少 SUPABASE_URL");
    if (!CONFIG.apiKey || CONFIG.apiKey.length < 50) issues.push("缺少有效的 SUPABASE_ANON_KEY");

    return {
      isValid: issues.length === 0,
      issues
    };
  },

  isConfigured() {
    const diag = this.getDiagnostics();
    return diag.isValid;
  },

  async fetchAll() {
    if (!this.isConfigured()) return [];

    try {
      const response = await fetch(`${CONFIG.url}/rest/v1/${CONFIG.table}?select=*&order=timestamp.desc`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Supabase Error:', err);
        throw new Error(err.message || 'Fetch failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Supabase Fetch Error:', error);
      return [];
    }
  },

  async save(data: any) {
    if (!this.isConfigured()) return;

    // 映射字段以符合 SQL 表结构 (employeeId -> employee_id)
    const payload = {
      id: data.id,
      name: data.name,
      employee_id: data.employeeId,
      contact_info: data.contactInfo,
      dietary: data.dietary,
      activity_interest: data.activityInterest,
      carpool: data.carpool,
      timestamp: data.timestamp
    };

    try {
      const response = await fetch(`${CONFIG.url}/rest/v1/${CONFIG.table}`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Save failed');
      }
    } catch (error) {
      console.error('Supabase Save Error:', error);
      throw error;
    }
  }
};
