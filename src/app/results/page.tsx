"use client";

import { useEffect, useState } from "react";
import { Typography, Paper, Button, Box } from "@mui/material";
import { Word } from "@/types/wordBank";
import PageLayout from "@/components/PageLayout";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart, PieChart } from "@mui/x-charts";

interface DictationResults {
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
      setResults(JSON.parse(storedResults));
    }
  }, []);

  if (!results) {
    return <PageLayout><Typography>Loading results...</Typography></PageLayout>;
  }

  const correctAnswers = results.answers.filter(
    (answer, index) => answer.toLowerCase() === results.words[index].term.toLowerCase()
  );
  
  const correctRate = (correctAnswers.length / results.words.length) * 100;
  const typingSpeed = Math.round((results.totalChars / results.elapsedTime) * 60);

  const correctCount = correctAnswers.length;
  const incorrectCount = results.words.length - correctCount;

  const pieData = [
    { id: 0, value: correctCount, label: 'Correct', color: '#4caf50' },
    { id: 1, value: incorrectCount, label: 'Incorrect', color: '#f44336' }
  ];

  const barData = [
    { value: typingSpeed, label: 'Typing Speed' },
    { value: correctRate, label: 'Accuracy %' }
  ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'No.', width: 70 },
    { field: 'word', headerName: 'Word', flex: 1 },
    { field: 'answer', headerName: 'Your Answer', flex: 1 },
    { 
      field: 'status', 
      headerName: 'Status', 
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
    <PageLayout>
      <Typography variant="h4" gutterBottom>
        Practice Results
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Accuracy
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

        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Performance
          </Typography>
          <BarChart
            series={[
              {
                data: barData.map(item => item.value),
              },
            ]}
            xAxis={[
              {
                data: barData.map(item => item.label),
                scaleType: 'band',
              },
            ]}
            height={200}
          />
          <Typography align="center">
            {typingSpeed} chars/min
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, height: 'calc(100vh - 500px)', minHeight: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Detailed Results
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: rows.length } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            height: 'calc(100% - 40px)',
            '& .success-row': {
              bgcolor: 'success.light',
            },
            '& .error-row': {
              bgcolor: 'error.light',
            },
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
        </Button>
        <Button 
          variant="outlined"
          onClick={() => window.print()}
        >
          Print Results
        </Button>
      </Box>
    </PageLayout>
  );
} 