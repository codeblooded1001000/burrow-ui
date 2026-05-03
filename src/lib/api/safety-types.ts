/** Mirrors API_CONTRACT.md safety + report DTOs. */

export type ReportCategory = 'HARASSMENT' | 'FAKE_PROFILE' | 'SCAM_BROKER' | 'INAPPROPRIATE' | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type ReportDto = {
  id: string;
  reportedUser: { id: string; fullName: string; companyName: string };
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type BlockDto = {
  id: string;
  blockedUserId: string;
  createdAt: string;
};

export type BlockListResponse = {
  items: {
    id: string;
    blockedUser: { id: string; fullName: string; photoUrl: string | null; companyName: string };
  }[];
};

export type PostReportBody = {
  reportedUserId: string;
  conversationId?: string;
  category: ReportCategory;
  detail?: string;
};

export type PostReportResponse = {
  report: ReportDto;
  autoBlocked: boolean;
};

export type ReportsMineResponse = {
  items: ReportDto[];
};
