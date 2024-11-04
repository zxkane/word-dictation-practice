"use client";

import { useState, useEffect, useRef } from "react";
import { TextField, Typography, Box, Breadcrumbs, Link, LinearProgress, styled, linearProgressClasses, Alert, AlertTitle, Paper, FormControl, InputLabel, Select, ListSubheader, MenuItem, Chip } from "@mui/material";
import { getWordBank, getWordBankPath } from "@/utils/wordBank";
import { Word } from "@/types/wordBank";
import DashboardLayout from "@/components/DashboardLayout";
import { Home } from '@mui/icons-material';
import { Gauge } from '@mui/x-charts';
import { DEFAULT_PLAY_SPEED, STORAGE_KEYS, VOICE_GENDER_OPTIONS, type VoiceGenderOption } from "@/types/configuration";
import { getStorageValue, addStorageListener } from "@/utils/storage";

const PLACEHOLDER = "N/A"; // Define placeholder as a constant

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

function LinearProgressWithLabel(props: { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

type SearchParams = {
  units: string;
  wordBankId: string;
}

// Update the recommended voices constant
const RECOMMENDED_VOICES = [
  {
    name: 'Microsoft David',
    description: 'Clear American male voice, moderate speed',
    gender: 'Male' as const,
    icon: '👨'
  },
  {
    name: 'Microsoft Zira',
    description: 'Clear American female voice, ideal for learning',
    gender: 'Female' as const,
    icon: '👩'
  },
  {
    name: 'Google US English',
    description: 'Google\'s accurate American female voice',
    gender: 'Female' as const,
    icon: '👩'
  },
  {
    name: 'Samantha',
    description: 'High-quality macOS female voice, natural tone',
    gender: 'Female' as const,
    icon: '👩'
  },
  {
    name: 'Daniel',
    description: 'High-quality macOS male voice, standard pronunciation',
    gender: 'Male' as const,
    icon: '👨'
  },
  {
    name: 'Microsoft Mark',
    description: 'Clear British male voice, excellent pronunciation',
    gender: 'Male' as const,
    icon: '👨'
  },
  {
    name: 'Microsoft Hazel',
    description: 'Professional British female voice, clear diction',
    gender: 'Female' as const,
    icon: '👩'
  },
  {
    name: 'Alex',
    description: 'High-quality macOS male voice, natural rhythm',
    gender: 'Male' as const,
    icon: '👨'
  },
  {
    name: 'Victoria',
    description: 'Clear Australian female voice, consistent pace',
    gender: 'Female' as const,
    icon: '👩'
  },
  {
    name: 'Karen',
    description: 'Australian female voice, excellent clarity',
    gender: 'Female' as const,
    icon: '👩'
  }
] as const;

// Update helper function
const getVoiceGender = (voice: SpeechSynthesisVoice) => {
  // Find matching recommended voice first
  const recommendedVoice = RECOMMENDED_VOICES.find(rec => 
    voice.name.includes(rec.name)
  );
  
  if (recommendedVoice) {
    return { gender: recommendedVoice.gender, icon: recommendedVoice.icon };
  }

  // Fallback to existing logic for non-recommended voices
  if (voice.name.toLowerCase().includes('male')) {
    return { gender: 'Male', icon: '👨' };
  }
  if (voice.name.toLowerCase().includes('female')) {
    return { gender: 'Female', icon: '👩' };
  }
  return { gender: 'Unknown', icon: '🔊' };
};

export default function DictationPage( 
  props: {
    searchParams: SearchParams
  }  
) {
  const REPEAT_WORD_DELAY = 3000; // milliseconds
  const INITIAL_WORD_DELAY = 1000; // milliseconds

  const { units, wordBankId } = props.searchParams;
  // Add new state for tracking answers
  const [words, setWords] = useState<Array<Word>>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(1).fill(PLACEHOLDER));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [speaking, setSpeaking] = useState(false);

  // Update show hints state and add listener
  const [showHints, setShowHints] = useState(() => 
    getStorageValue(STORAGE_KEYS.SHOW_HINTS, false)
  );

  // Add storage listener
  useEffect(() => {
    const cleanup = addStorageListener<boolean>(STORAGE_KEYS.SHOW_HINTS, (newValue) => {
      setShowHints(newValue);
    });
    
    return cleanup; // Clean up listener when component unmounts
  }, []);

  // Add queue state
  const [audioQueue, setAudioQueue] = useState<NodeJS.Timeout[]>([]);

  // Add new state for tracking elapsed time
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentWordElapsedTime, setCurrentWordElapsedTime] = useState(0);

  // Add new state for speech rate
  const [speechRate, setSpeechRate] = useState(() => 
    getStorageValue(STORAGE_KEYS.PLAY_SPEED, DEFAULT_PLAY_SPEED.value)
  );

  // Add storage listener for speech rate
  useEffect(() => {
    const cleanup = addStorageListener<number>(STORAGE_KEYS.PLAY_SPEED, (newValue) => {
      setSpeechRate(newValue);
    });
    
    return cleanup;
  }, []);

  // Add new state for play times
  const [playTimes, setPlayTimes] = useState(() => 
    getStorageValue(STORAGE_KEYS.PLAY_TIMES, 2) // Default to 2 times if not set
  );

  // Add storage listener for play times
  useEffect(() => {
    const cleanup = addStorageListener<number>(STORAGE_KEYS.PLAY_TIMES, (newValue) => {
      setPlayTimes(newValue);
    });
    
    return cleanup;
  }, []);

  // Add voice gender preference state
  const [preferredGender, setPreferredGender] = useState<VoiceGenderOption>(() => 
    getStorageValue(STORAGE_KEYS.VOICE_GENDER, VOICE_GENDER_OPTIONS.ALL)
  );

  // Add storage listener for voice gender preference
  useEffect(() => {
    const cleanup = addStorageListener<VoiceGenderOption>(
      STORAGE_KEYS.VOICE_GENDER, 
      (newValue) => {
        setPreferredGender(newValue);
      }
    );
    
    return cleanup;
  }, []);

  // Helper function to filter voices by gender
  const filterVoicesByGender = (voices: SpeechSynthesisVoice[]) => {
    if (preferredGender === VOICE_GENDER_OPTIONS.ALL) {
      return voices;
    }

    return voices.filter(voice => {
      const recommendation = RECOMMENDED_VOICES.find(rec => 
        voice.name.includes(rec.name)
      );
      
      if (recommendation) {
        return preferredGender === VOICE_GENDER_OPTIONS.MALE ? 
          recommendation.gender === 'Male' : 
          recommendation.gender === 'Female';
      }

      // For non-recommended voices, use the helper function
      const { gender } = getVoiceGender(voice);
      return preferredGender === VOICE_GENDER_OPTIONS.MALE ? 
        gender === 'Male' : 
        gender === 'Female';
    });
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add new state for selected voice
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Get words from selected word bank's units and shuffle them
    const selectedUnits = units.split(",");
    const wordBank = getWordBank(getWordBankPath(wordBankId));
    const allWords = wordBank.units
        .filter((unit: { id: string }) => selectedUnits.includes(unit.id))
        .flatMap((unit: { words: Word[] }) => unit.words);
    const shuffledWords = shuffleArray(allWords);
    setWords(shuffledWords);
    setUserAnswers(new Array(shuffledWords.length).fill(PLACEHOLDER));
    
    // Select a random voice once
    const voices = window.speechSynthesis.getVoices();
    const recommendedVoiceNames = RECOMMENDED_VOICES
      .filter(rec => preferredGender === VOICE_GENDER_OPTIONS.ALL || 
        (preferredGender === VOICE_GENDER_OPTIONS.MALE ? rec.gender === 'Male' : rec.gender === 'Female'))
      .map(rec => rec.name);
      
    const availableRecommendedVoices = voices.filter(voice => 
      recommendedVoiceNames.some(name => voice.name.includes(name))
    );
    
    if (availableRecommendedVoices.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableRecommendedVoices.length);
      setSelectedVoice(availableRecommendedVoices[randomIndex]);
    }    
  }, [props.searchParams, preferredGender]);

  useEffect(() => {
     // Play the first word after words are loaded and voice is selected
    if (words.length > 0) {
      setTimeout(() => {
        playCurrentWord(words, 0);
      }, INITIAL_WORD_DELAY);
    }  }, [words, selectedVoice]);

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
    
    clearAudioQueue();

    const createUtterance = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.volume = 1.0;
      return utterance;
    };

    const utterance = createUtterance(words[index].term);
    
    // Handle speech events
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      
      // Queue additional utterances based on playTimes setting
      let playCount = 1;
      const queueNextUtterance = () => {
        if (playCount < playTimes) {
          const timeoutId = setTimeout(() => {
            const nextUtterance = createUtterance(words[index].term);
            window.speechSynthesis.speak(nextUtterance);
            playCount++;
            if (playCount < playTimes) {
              queueNextUtterance();
            }
          }, REPEAT_WORD_DELAY);
          
          setAudioQueue(prev => [...prev, timeoutId]);
        }
      };
      
      queueNextUtterance();
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

  // Add this function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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
          <Typography color="text.primary">Dictation Practice</Typography>
        </Breadcrumbs>

        <Alert 
          severity="info" 
          variant="outlined" 
          sx={{ mb: 2 }}
        >
          <AlertTitle>Type the word you hear... (Press Enter to submit)</AlertTitle>
          输入你听到的单词...（按回车键提交）
        </Alert>

        <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {showHints && words[currentWordIndex] && words[currentWordIndex].definition && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  fontStyle: 'italic',
                  width: '100%'
                }}
              >
                Hint(提示): {words[currentWordIndex].definition}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Type the word you hear... (Press Enter to submit) | 输入你听到的单词...（按回车键提交）"
            autoFocus
          />
            <LinearProgressWithLabel 
              value={(words.length == 0 ? 0 : userAnswers.filter(answer => answer !== PLACEHOLDER).length / words.length) * 100} 
            />
        </Paper>

        {/* Replace the Typography components for time with these Gauges */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2">Total Time</Typography>
            <Gauge
              value={elapsedTime % 60}
              valueMax={words.length * 30}
              text={formatTime(elapsedTime)}
              sx={{ width: 150, height: 150 }}
            />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2">Current Word Time</Typography>
            <Gauge
              value={currentWordElapsedTime % 60}
              valueMax={30}
              text={formatTime(currentWordElapsedTime)}
              sx={{ width: 150, height: 150 }}
              startAngle={-90} endAngle={90}
            />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
