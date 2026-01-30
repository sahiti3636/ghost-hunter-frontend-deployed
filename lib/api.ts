/**
 * API client for Ghost Hunter backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface AnalysisConfig {
  region_type: 'custom' | 'mpa';
  region_data?: {
    polygon?: number[][];
    mpa_id?: string;
  };
  start_date?: string;
  end_date?: string;
}

export interface AnalysisStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  current_step?: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface Vessel {
  id: string;
  name: string;
  risk: number;
  status: string;
  lastSeen: string;
  lat: number;
  lng: number;
  type: string;
  flag: string;
  ais_status: string;
  cnn_confidence: number;
  detection_confidence: number;
  behavior_analysis: any;
  coordinates: string;
}

export interface AnalysisResults {
  analysis_id: string;
  vessels: Vessel[];
  satellite_image?: {
    url: string;
    bounds: [[number, number], [number, number]];
  };
  overlay_image_url?: string;
  intelligence_summary: any;
  detection_summary?: {
    total_vessels: number;
    dark_vessels: number;
    high_risk_vessels: number;
  };
}

export interface MPA {
  id: string;
  name: string;
  area: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; pipeline_ready: boolean }> {
    return this.request('/health');
  }

  // Analysis endpoints
  async startAnalysis(config: AnalysisConfig): Promise<{ analysis_id: string; status: string; message: string }> {
    return this.request('/analysis/start', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
    return this.request(`/analysis/${analysisId}/status`);
  }

  async getAnalysisResults(analysisId: string): Promise<AnalysisResults> {
    return this.request(`/analysis/${analysisId}/results`);
  }

  // Vessel intelligence
  async getVesselIntelligence(vesselId: string, analysisId: string): Promise<{
    vessel_id: string;
    analysis: string;
    threat_level: string;
    coordinates: string;
    risk_score: number;
    priority: number;
  }> {
    return this.request(`/vessel/${vesselId}/intelligence?analysis_id=${analysisId}`);
  }

  // Report management
  async downloadReport(analysisId: string, format: 'json' | 'markdown' | 'pdf' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/report?format=${format}`);

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
  }

  async sendReport(analysisId: string, email: string, includeAttachments: boolean = true): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    return this.request(`/analysis/${analysisId}/send-report`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        include_attachments: includeAttachments,
      }),
    });
  }

  // MPA data
  async getMPAs(): Promise<{ mpas: MPA[] }> {
    return this.request('/mpas');
  }

  // File upload
  async uploadSatelliteData(file: File): Promise<{
    status: string;
    filename: string;
    size: number;
    timestamp: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload/satellite', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Analysis history
  async getAnalysesHistory(): Promise<{
    analyses: Array<{
      id: string;
      status: string;
      region_type: string;
      created_at: string;
      completed_at: string;
      error_message: string;
    }>;
  }> {
    return this.request('/analyses');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Utility functions
export const formatThreatLevel = (level: string): { color: string; label: string } => {
  const upperLevel = level.toUpperCase();

  if (upperLevel.includes('HIGH')) {
    return { color: '#ef4444', label: 'HIGH THREAT' };
  } else if (upperLevel.includes('MODERATE')) {
    return { color: '#f59e0b', label: 'MODERATE THREAT' };
  } else if (upperLevel.includes('LOW')) {
    return { color: '#10b981', label: 'LOW THREAT' };
  } else {
    return { color: '#6b7280', label: 'UNKNOWN' };
  }
};

export const formatRiskScore = (score: number): { color: string; level: string } => {
  if (score >= 80) {
    return { color: '#ef4444', level: 'Critical' };
  } else if (score >= 60) {
    return { color: '#f59e0b', level: 'High' };
  } else if (score >= 40) {
    return { color: '#f59e0b', level: 'Suspicious' };
  } else if (score >= 20) {
    return { color: '#10b981', level: 'Low' };
  } else {
    return { color: '#6b7280', level: 'Clear' };
  }
};