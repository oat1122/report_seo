// src/types/history.ts

/**
 * ประวัติการเปลี่ยนแปลงของ Overall Metrics
 * บันทึกค่าต่างๆ ของ Domain ในแต่ละช่วงเวลา
 */
export interface OverallMetricsHistory {
  id: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
  ageInMonths: number;
  spamScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  dateRecorded: Date;
  customerId: string;
}

/**
 * ประวัติการเปลี่ยนแปลงของ Keyword Report
 * บันทึกตำแหน่งและข้อมูลของ Keywords ในแต่ละช่วงเวลา
 */
export interface KeywordReportHistory {
  id: string;
  keyword: string;
  position: number | null;
  traffic: number;
  kd: string;
  isTopReport: boolean;
  dateRecorded: string;
  reportId: string;
}
