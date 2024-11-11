"use client";

import { useEffect, useState } from "react";
import { Typography, Paper, Button, Box, CircularProgress, Breadcrumbs, Link } from "@mui/material";
import { Home } from '@mui/icons-material';
import { Word } from "@/types/wordBank";
import DashboardLayout from "@/components/DashboardLayout";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart, PieChart } from "@mui/x-charts";
import { recordEvent } from "@/utils/clickstream";

interface DictationResults {
  wordBankName: string;
  units: string;
  answers: string[];
  words: Word[];
  elapsedTime: number;
  totalChars: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<DictationResults | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('dictationResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      setResults(parsedResults);
      
      // Calculate metrics once
      const correctAnswers = parsedResults.answers.filter(
        (answer: string, index: number) => 
          answer.toLowerCase() === parsedResults.words[index].term.toLowerCase()
      );
      const correctRate = (correctAnswers.length / parsedResults.words.length) * 100;
      const typingSpeed = Math.round((parsedResults.totalChars / parsedResults.elapsedTime) * 60);
      const wordsPerMinute = Math.round((parsedResults.words.length / parsedResults.elapsedTime) * 60);

      // Record the dictation results using calculated metrics
      recordEvent('dictation_completed', {
        word_bank_name: parsedResults.wordBankName,
        units: parsedResults.units,
        total_words: parsedResults.words.length,
        correct_words: correctAnswers.length,
        accuracy_rate: correctRate,
        typing_speed_cpm: typingSpeed,
        words_per_minute: wordsPerMinute,
        elapsed_time_seconds: parsedResults.elapsedTime
      });
    }
  }, []);

  if (!results) {
    return (
      <DashboardLayout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '50vh',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Loading results...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const correctAnswers = results.answers.filter(
    (answer, index) => answer.toLowerCase() === results.words[index].term.toLowerCase()
  );
  
  const correctRate = (correctAnswers.length / results.words.length) * 100;
  const typingSpeed = Math.round((results.totalChars / results.elapsedTime) * 60);
  const wordsPerMinute = Math.round((results.words.length / results.elapsedTime) * 60);

  const correctCount = correctAnswers.length;
  const incorrectCount = results.words.length - correctCount;

  const pieData = [
    { id: 0, value: correctCount, label: 'Correct', color: '#4caf50' },
    { id: 1, value: incorrectCount, label: 'Incorrect', color: '#f44336' }
  ];

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'No.',
      description: '序号', 
      width: 70 
    },
    { 
      field: 'word', 
      headerName: 'Word',
      description: '单词', 
      flex: 1 
    },
    { 
      field: 'answer', 
      headerName: 'Your Answer',
      description: '你的答案', 
      flex: 1 
    },
    { 
      field: 'status', 
      headerName: 'Result',
      description: '结果',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: params.value ? 'success.main' : 'error.main' }}>
          {params.value ? '✓' : '✗'}
        </Box>
      )
    }
  ];

  const rows = results.words.map((word, index) => ({
    id: index + 1,
    word: word.term,
    answer: results.answers[index],
    status: results.answers[index].toLowerCase() === word.term.toLowerCase()
  }));

  return (
    <DashboardLayout>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1600px', // Add maximum width
        mx: 'auto',
        px: { xs: 0.5, sm: 1 },
        boxSizing: 'border-box',
        overflowX: 'hidden'
        }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="/"
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary">
            Practice
          </Typography>
          <Typography color="text.secondary">
            {results.wordBankName}
          </Typography>
          <Typography color="text.secondary">
            {results.units}
          </Typography>
          <Typography color="text.primary">
            Results
          </Typography>
        </Breadcrumbs>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2, 
          mb: 3,
          width: '100%',
        }}>
          <Paper sx={{ 
            p: 3,
            width: {
              xs: '100%',              // Full width on mobile
              sm: 'calc(50% - 8px)',   // 2 per row (subtract half of gap)
              lg: 'calc(25% - 12px)',  // 4 per row (subtract 3/4 of gap)
            },
            flexGrow: 1,
          }}>
            <Typography variant="h6" gutterBottom>
              Dictation Accuracy
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              听写准确率
            </Typography>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 60,
                  outerRadius: 80,
                  paddingAngle: 5,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                },
              ]}
              height={200}
            />
            <Typography align="center">
              {correctRate.toFixed(1)}% Accuracy
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 3,
            width: {
              xs: '100%',              // Full width on mobile
              sm: 'calc(50% - 8px)',   // 2 per row (subtract half of gap)
              lg: 'calc(25% - 12px)',  // 4 per row (subtract 3/4 of gap)
            },
            flexGrow: 1,
          }}>
            <Typography variant="h6" gutterBottom>
              Spell Error Count
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              拼写错误数
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: 200 
            }}>
              <Typography variant="h2" color="error.main">
                {incorrectCount}
              </Typography>
            </Box>
            <Typography align="center">
              {correctCount} correct, {incorrectCount} incorrect
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 3,
            width: {
              xs: '100%',              // Full width on mobile
              sm: 'calc(50% - 8px)',   // 2 per row (subtract half of gap)
              lg: 'calc(25% - 12px)',  // 4 per row (subtract 3/4 of gap)
            },
            flexGrow: 1,
          }}>
            <Typography variant="h6" gutterBottom>
              Characters Per Minute
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              每分钟字符数
            </Typography>
            <BarChart
              series={[
                {
                  data: [typingSpeed],
                  color: '#2196f3'
                },
              ]}
              xAxis={[
                {
                  data: ['CPM'],
                  scaleType: 'band',
                },
              ]}
              height={200}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              yAxis={[{ min: 0 }]}
            />
            <Typography align="center">
              {typingSpeed} CPM
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 3,
            width: {
              xs: '100%',              // Full width on mobile
              sm: 'calc(50% - 8px)',   // 2 per row (subtract half of gap)
              lg: 'calc(25% - 12px)',  // 4 per row (subtract 3/4 of gap)
            },
            flexGrow: 1,
          }}>
            <Typography variant="h6" gutterBottom>
              Words Per Minute
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              每分钟单词数
            </Typography>
            <BarChart
              series={[
                {
                  data: [wordsPerMinute],
                  color: '#9c27b0'
                },
              ]}
              xAxis={[
                {
                  data: ['WPM'],
                  scaleType: 'band',
                },
              ]}
              height={200}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
              yAxis={[{ min: 0 }]}
            />
            <Typography align="center">
              {wordsPerMinute} WPM
            </Typography>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, height: 'auto', minHeight: '500px' }}>
          <Typography variant="h6" gutterBottom>
            Detailed Results
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            详细结果
          </Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { 
                paginationModel: { 
                  pageSize: 25,
                  page: 0
                } 
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            pagination={true}
            sx={{
              height: 'calc(100% - 40px)',
              '& .success-row': {
                bgcolor: 'success.light',
                '&:hover': {
                  bgcolor: 'success.main',
                  opacity: 0.8,
                }
              },
              '& .error-row': {
                bgcolor: 'error.light',
                '&:hover': {
                  bgcolor: 'error.main',
                  opacity: 0.8,
                }
              },
              '& .MuiDataGrid-footerContainer': {
                bgcolor: 'white',
                '& .MuiTablePagination-root': {
                  color: (theme) => 
                    correctRate >= 50 ? theme.palette.success.main : theme.palette.error.main,
                }
              }
            }}
            getRowClassName={(params) => 
              params.row.status ? 'success-row' : 'error-row'
            }
            disableRowSelectionOnClick
          />
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/'}
          >
            Back to Home
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
              返回主页
            </Typography>
          </Button>
          <Button 
            variant="outlined"
            onClick={() => window.print()}
          >
            Print Results
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
              打印结果
            </Typography>
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
} 