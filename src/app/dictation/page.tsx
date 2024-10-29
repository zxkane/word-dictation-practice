"use client";

import { useState, useEffect, useRef } from "react";
import { Container, TextField, Typography, Switch, FormControlLabel, Box } from "@mui/material";
import { getWordBank, getWordBankPath } from "@/utils/wordBank";
import { Word } from "@/types/wordBank";

const PLACEHOLDER = "N/A"; // Define placeholder as a constant

interface DictationProps {
  searchParams: { 
    units: string; 
    wordBankId: string;
  };
}

export default function DictationPage({ searchParams }: DictationProps) {
  const REPEAT_WORD_DELAY = 3000; // milliseconds
  const INITIAL_WORD_DELAY = 1000; // milliseconds

  const { units, wordBankId } = searchParams;
  // Add new state for tracking answers
  const [words, setWords] = useState<Array<Word>>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(words.length).fill(PLACEHOLDER));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [speaking, setSpeaking] = useState(false);

  // Add new states for hints
  const [showHints, setShowHints] = useState(false);

  // Add queue state
  const [audioQueue, setAudioQueue] = useState<NodeJS.Timeout[]>([]);

  // Add new state for tracking elapsed time
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentWordElapsedTime, setCurrentWordElapsedTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get words from selected word bank's units and shuffle them
    const selectedUnits = units.split(",");
    const wordBank = getWordBank(getWordBankPath(wordBankId));
    const allWords = wordBank.units
        .filter((unit: { id: string }) => selectedUnits.includes(unit.id))
        .flatMap((unit: { words: Word[] }) => unit.words);
    const shuffledWords = shuffleArray(allWords);
    setWords(shuffledWords);
    
    // Play the first word after words are loaded
    if (shuffledWords.length > 0) {
      setTimeout(() => {
        playCurrentWord(shuffledWords, 0);
      }, INITIAL_WORD_DELAY);
    }

  }, [searchParams]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setCurrentWordElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentWordIndex]);

  useEffect(() => {
    if (words.length > 0 && words.length == userAnswers.length &&
       userAnswers.filter(answer => answer === PLACEHOLDER).length === 0) {
      // practice completed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Calculate total characters typed
      const totalChars = userAnswers.reduce((sum, answer) => sum + answer.length, 0);
        
      // Navigate to results page with data
      const results = {
        answers: userAnswers,
        words: words,
        elapsedTime,
        totalChars,
      };
              
      // Store results in sessionStorage to handle large datasets
      sessionStorage.setItem('dictationResults', JSON.stringify(results));
      window.location.href = '/results';
    }
  }, [userAnswers, words]);

  const shuffleArray = (array: Word[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const playCurrentWord = (words: Word[], index: number) => {
    if (speaking) return;
    
    // Clear existing queue
    clearAudioQueue();

    const createUtterance = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language (can be changed based on your needs)
      utterance.rate = 0.6; // Slightly slower speed (default is 1)
      return utterance;
    };

    const utterance = createUtterance(words[index].term);
    
    // Handle speech events
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      // Queue the second utterance
      const timeoutId = setTimeout(() => {
        const secondUtterance = createUtterance(words[index].term);
        window.speechSynthesis.speak(secondUtterance);
      }, REPEAT_WORD_DELAY);
      
      // Add to queue
      setAudioQueue(prev => [...prev, timeoutId]);
    };

    window.speechSynthesis.speak(utterance);
  };

  const clearAudioQueue = () => {
    // Clear all timeouts in the queue
    audioQueue.forEach(timeoutId => clearTimeout(timeoutId));
    setAudioQueue([]);
    // Also stop any current speech
    window.speechSynthesis.cancel();
  };

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Clear queue when moving to next word
      clearAudioQueue();

      setUserAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentWordIndex] = userInput;
        return newAnswers;
      });

      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
        // Set input to previously stored answer for the next word (if any)
        setUserInput(userAnswers[currentWordIndex + 1] === PLACEHOLDER ? "" : userAnswers[currentWordIndex + 1]);
        playCurrentWord(words, currentWordIndex + 1);
        // Reset current word timer
        setCurrentWordElapsedTime(0);
      } else {
        // Store the last input when it's the last word
        setUserAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentWordIndex] = userInput;
          return newAnswers;
        });
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dictation Practice
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <FormControlLabel
          control={
            <Switch
              checked={showHints}
              onChange={(e) => setShowHints(e.target.checked)}
            />
          }
          label="Show Hints"
        />
      </Box>

      {showHints && words[currentWordIndex] && (
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            fontStyle: 'italic'
          }}
        >
          Hint: {words[currentWordIndex].definition}
        </Typography>
      )}

      <TextField
        fullWidth
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyPress={handleSubmit}
        placeholder="Type the word you hear... (Press Enter to submit)"
        autoFocus
      />
      {/* Add display for all answers */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        Progress: {userAnswers.filter(answer => answer !== PLACEHOLDER).length} / {words.length} words attempted
      </Typography>

      {/* Display elapsed time */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Total Time Elapsed: {elapsedTime} seconds
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Current Word Time Elapsed: {currentWordElapsedTime} seconds
      </Typography>
    </Container>
  );
}
