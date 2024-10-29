"use client";

import { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, Paper, Button, Box } from "@mui/material";
import { Word } from "@/types/wordBank";

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
    return <Container><Typography>Loading results...</Typography></Container>;
  }

  const correctAnswers = results.answers.filter(
    (answer, index) => answer.toLowerCase() === results.words[index].term.toLowerCase()
  );
  
  const correctRate = (correctAnswers.length / results.words.length) * 100;
  const typingSpeed = Math.round((results.totalChars / results.elapsedTime) * 60);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Practice Results
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography>
          Correct Rate: {correctRate.toFixed(1)}%
        </Typography>
        <Typography>
          Total Time: {results.elapsedTime} seconds
        </Typography>
        <Typography>
          Typing Speed: {typingSpeed} characters per minute
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Results
        </Typography>
        <List>
          {results.words.map((word, index) => {
            const isCorrect = results.answers[index].toLowerCase() === word.term.toLowerCase();
            return (
              <ListItem 
                key={index}
                sx={{
                  bgcolor: isCorrect ? 'success.light' : 'error.light',
                  mb: 1,
                  borderRadius: 1
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography>
                    {isCorrect ? '✓' : '✗'} Word {index + 1}: {word.term}
                  </Typography>
                  {!isCorrect && (
                    <>
                      <Typography>
                        Your answer: {results.answers[index]}
                      </Typography>
                      <Typography sx={{ color: 'error.dark' }}>
                        Correct spelling: {word.term}
                      </Typography>
                    </>
                  )}
                </Box>
              </ListItem>
            );
          })}
        </List>
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
    </Container>
  );
} 