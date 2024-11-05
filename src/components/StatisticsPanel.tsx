import { Box, Card, Typography, Stack } from '@mui/material';

interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  showScale?: boolean;
  maxScale?: number;
}

export const StatCard = ({ 
  value, 
  label, 
  sublabel, 
}: StatCardProps) => (
  <Card sx={{ 
    p: 2, 
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'success.main',
    height: '100%',
    position: 'relative'
  }}>
    <Stack spacing={1}>
      <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      <Box>
        <Typography variant="body1" color="text.primary">
          {label}
        </Typography>
      </Box>
      {sublabel && (
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
      )}
    </Stack>
  </Card>
);
