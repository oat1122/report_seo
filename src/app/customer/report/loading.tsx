import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Box, Container, Skeleton, Stack } from "@mui/material";

export default function CustomerReportLoading() {
  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Skeleton variant="text" width="60%" height={56} />
          <Skeleton variant="text" width="35%" height={32} />
        </Stack>

        {/* Summary stats — 4 KPI cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 4,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={120}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>

        {/* Overall metrics + recommendations */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 3,
            mb: 4,
          }}
        >
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
        </Box>

        {/* Trend charts */}
        <Skeleton
          variant="rounded"
          height={320}
          sx={{ borderRadius: 3, mb: 4 }}
        />
        <Skeleton
          variant="rounded"
          height={320}
          sx={{ borderRadius: 3, mb: 4 }}
        />

        {/* Top keywords */}
        <Skeleton
          variant="rounded"
          height={360}
          sx={{ borderRadius: 3, mb: 4 }}
        />

        {/* Other keywords + AI overview */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" },
            gap: 3,
          }}
        >
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    </DashboardLayout>
  );
}
