import { Container, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        textAlign: 'center',
        mb: 6
      }}>
        <Typography 
          variant="h2" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 2
          }}
        >
          英语单词听写
        </Typography>
        <Typography 
          variant="h4"
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          键盘输入练习
        </Typography>
      </Box>
      {children}
    </Container>
  );
};

export default PageLayout; 