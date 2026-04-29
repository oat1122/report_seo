import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Box, Container, Skeleton, Stack } from "@mui/material";

export default function CustomerLoading() {
  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero skeleton */}
        <Skeleton
          variant="rounded"
          height={220}
          sx={{ borderRadius: 4, mb: 5 }}
        />

        {/* Promotion skeleton */}
        <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Skeleton variant="rounded" width={180} height={36} />
          <Skeleton variant="text" width={320} height={42} />
          <Skeleton variant="text" width={260} />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={360}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>

        {/* Quick actions skeleton */}
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Skeleton variant="text" width={180} height={48} />
          <Skeleton variant="text" width={280} />
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
          }}
        >
          {[0, 1].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={180}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      </Container>
    </DashboardLayout>
  );
}
