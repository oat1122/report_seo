import { requireCustomer } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import {
  OverallMetricsCard,
  KeywordReportTable,
} from "@/components/Customer/Report";
import { OverallMetrics, KeywordReport } from "@/types/metrics";
import { Typography, Container, Box } from "@mui/material";
import { prisma } from "@/lib/prisma"; // Direct DB access

interface ReportData {
  metrics: OverallMetrics | null;
  topKeywords: KeywordReport[];
  otherKeywords: KeywordReport[];
  customerName: string | null;
  domain: string | null;
}

// Server-side function to fetch data directly
async function getReportData(userId: string): Promise<ReportData> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!customer) {
    return {
      metrics: null,
      topKeywords: [],
      otherKeywords: [],
      customerName: null,
      domain: null,
    };
  }

  const [metrics, keywords] = await Promise.all([
    prisma.overallMetrics.findUnique({
      where: { customerId: customer.id },
    }),
    prisma.keywordReport.findMany({
      where: { customerId: customer.id },
      orderBy: [{ position: "asc" }],
    }),
  ]);

  const topKeywords = keywords
    .filter((kw) => kw.isTopReport)
    .map((kw) => ({
      ...kw,
      dateRecorded: kw.dateRecorded.toISOString(),
    }));
  const otherKeywords = keywords
    .filter((kw) => !kw.isTopReport)
    .map((kw) => ({
      ...kw,
      dateRecorded: kw.dateRecorded.toISOString(),
    }));

  return {
    metrics: metrics
      ? {
          ...metrics,
          dateRecorded: metrics.dateRecorded.toISOString(),
        }
      : null,
    topKeywords,
    otherKeywords,
    customerName: customer.user.name,
    domain: customer.domain,
  };
}

export default async function CustomerReportPage() {
  const session = await requireCustomer();
  const data = await getReportData(session.user.id);

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom>
          SEO Report
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          {data.domain || "N/A"}
        </Typography>
        <OverallMetricsCard metrics={data.metrics} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <KeywordReportTable keywords={data.topKeywords} />
          <KeywordReportTable keywords={data.otherKeywords} />
        </Box>
      </Container>
    </DashboardLayout>
  );
}
