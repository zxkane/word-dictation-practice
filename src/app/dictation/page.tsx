"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Grid2';
import { getWordBank, getWordBankPath } from "@/utils/wordBank";
import { Word, WordBank } from "@/types/wordBank";
import DashboardLayout from "@/components/DashboardLayout";
import { Home } from '@mui/icons-material';
import { Gauge } from '@mui/x-charts';
import { DEFAULT_PLAY_SPEED, STORAGE_KEYS, VOICE_GENDER_OPTIONS, type VoiceGenderOption } from "@/types/configuration";
import { getStorageValue, addStorageListener } from "@/utils/storage";
import { styled } from "@mui/material";

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

// Add the SoftKeyboard component
function SoftKeyboard(props: { 
  onKeyPress: (key: string) => void,
  pressedKey: string | null
}) {

  const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
    ["SPACE", "BACKSPACE"],
  ];

  return (
    <Box sx={{ 
      mt: 2,
      // Add max-width to contain the entire keyboard
      maxWidth: { xs: '300px', sm: '100%' }, 
      mx: 'auto'
    }}>
      {keys.map((row, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            mb: 0.5, // Reduce vertical spacing between rows
            gap: { xs: 0.25, sm: 0.5 } // Reduce gap between buttons
          }}
        >
          {row.map((key) => (
            <Button
              key={key}
              variant="outlined"
              sx={{ 
                minWidth: { xs: '28px', sm: '40px', lg: '60px' }, // Wider buttons only on large screens
                height: { xs: '28px', sm: '40px', lg: '60px' }, // Match height to width
                p: { xs: 0, sm: 1, lg: 1.5 }, // More padding on large screens
                fontSize: { xs: '0.7rem', sm: '0.875rem', lg: '1rem' }, // Larger font on large screens
                bgcolor: props.pressedKey === key ? 'primary.dark' : 'transparent',
                // Special width for space and backspace
                ...(key === "SPACE" || key === "BACKSPACE" ? {
                  minWidth: { xs: '60px', sm: '80px', lg: '120px' } // Even wider special keys on large screens
                } : {}),
                m: { xs: 0.25, sm: 0.5 } // More margin between keys on large screens
              }}
            >
              {key === "SPACE"
                ? "Space"
                : key === "BACKSPACE"
                ? "←" // Backspace symbol
                : key}
            </Button>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default function DictationPage(props: { searchParams: SearchParams }) {
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add new state for selected voice
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  // Move this declaration up with other state declarations
  const [isReadyToPractice, setIsReadyToPractice] = useState(false);

  // Update wordBank state with WordBank type
  const [wordBank, setWordBank] = useState<WordBank | null>(null);

  // Wrap isDataReady in useCallback
  const isDataReady = useCallback(() => {
    return words.length > 0 && 
           showHints !== undefined && 
           speechRate !== undefined && 
           playTimes !== undefined && 
           preferredGender !== undefined && 
           selectedVoice !== null;
  }, [words.length, showHints, speechRate, playTimes, preferredGender, selectedVoice]);

  // Update the initial data loading effect
  useEffect(() => {
    setIsLoading(true);
    // Get words from selected word bank's units and shuffle them
    const selectedUnits = units.split(",");
    const wordBank = getWordBank(getWordBankPath(wordBankId));
    setWordBank(wordBank);
    const allWords = wordBank.units
        .filter((unit: { id: string }) => selectedUnits.includes(unit.id))
        .flatMap((unit: { words: Word[] }) => unit.words);
    const shuffledWords = shuffleArray(allWords);
    setWords(shuffledWords);
    setUserAnswers(new Array(shuffledWords.length).fill(PLACEHOLDER));
    
    // Select a random voice once
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en-'));
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

    // Check if all data is ready
    if (isDataReady()) {
      setIsLoading(false);
    }
  }, [props.searchParams, preferredGender, isDataReady, units, wordBankId]);

  // Add effect to check when data becomes ready
  useEffect(() => {
    if (isDataReady()) {
      setIsLoading(false);
    }
  }, [words, showHints, speechRate, playTimes, preferredGender, selectedVoice, isDataReady]);

  // Move clearAudioQueue before playCurrentWord
  const clearAudioQueue = useCallback(() => {
    audioQueue.forEach(timeoutId => clearTimeout(timeoutId));
    setAudioQueue([]);
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [audioQueue]);

  // Now playCurrentWord can use clearAudioQueue
  const playCurrentWord = useCallback((words: Word[], index: number) => {
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
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      
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
  }, [speaking, selectedVoice, speechRate, playTimes, clearAudioQueue]);

  useEffect(() => {
    // Play the first word after words are loaded and voice is selected
    if (words.length > 0 && isReadyToPractice) {
      setTimeout(() => {
        playCurrentWord(words, 0);
      }, INITIAL_WORD_DELAY);
    }
  }, [words, selectedVoice, isReadyToPractice]);

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

  // Add state to control the display of the soft keyboard
  const [showSoftKeyboard, setShowSoftKeyboard] = useState(true);

  // Add new state to track the currently pressed key
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Add keydown and keyup event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === ' ') {
        setPressedKey('SPACE');
      } else if (key === 'BACKSPACE') {
        setPressedKey('BACKSPACE');
      } else {
        setPressedKey(key);
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSoftKeyPress = (key: string) => {
    if (key === "BACKSPACE") {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + key);
    }
  };

  // Add new states for review section
  const [showReview, setShowReview] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const wordsPerPage = 12;

  // Add sorted words computation
  const sortedWords = [...words].sort((a, b) => a.term.localeCompare(b.term));
  const pageCount = Math.ceil(sortedWords.length / wordsPerPage);
  const currentPageWords = sortedWords.slice(
    (reviewPage - 1) * wordsPerPage,
    reviewPage * wordsPerPage
  );

  return (
    <DashboardLayout>
      {isLoading ? (
        // Loading State
        <Box sx={{ 
          width: '100%',
          maxWidth: 800,
          mx: 'auto',
          px: 3,
          textAlign: 'center',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '80%', maxWidth: 400 }}>
              <LinearProgress />
            </Box>
          </Box>
          <Typography sx={{ mt: 2 }} variant="body1" color="text.secondary">
            Loading dictation practice...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            正在加载听写练习...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%',
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
            <Typography color="text.primary">
              {wordBank?.name}
            </Typography>
            <Typography color="text.primary">
              {wordBank?.units
                .filter(unit => units.split(",").includes(unit.id))
                .map(unit => unit.name)
                .join(", ")}
            </Typography>
            <Typography color="text.primary">
              {showReview ? "Word Review" : "Dictation Practice"}
            </Typography>
          </Breadcrumbs>

          {showReview ? (
            // Review Section Content
            <Container maxWidth="lg">
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {currentPageWords.map((word, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                          {word.term}
                        </Typography>
                        {word.definition && (
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            {word.definition}
                          </Typography>
                        )}
                        {word.examples && word.examples.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2">Examples:</Typography>
                            {word.examples.map((example, i) => (
                              <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                                • {example}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Pagination 
                    count={pageCount} 
                    page={reviewPage} 
                    onChange={(_, value) => setReviewPage(value)}
                    color="primary"
                  />
                </Box>
              )}

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                position: 'sticky',
                bottom: 16,
                zIndex: 1
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowReview(false);
                    setIsReadyToPractice(true);
                  }}
                  sx={{ 
                    minWidth: 200,
                    boxShadow: 3 // Added shadow for better visibility
                  }}
                >
                  Ready to Practice
                  <Typography 
                    variant="caption" 
                    display="block" 
                    sx={{ opacity: 0.8 }}
                  >
                    开始练习
                  </Typography>
                </Button>
              </Box>
            </Container>
          ) : (
            // Practice Section Content
            <>
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
                  onFocus={() => setShowSoftKeyboard(true)}
                  autoComplete="off"
                />

                <LinearProgressWithLabel 
                  value={(words.length == 0 ? 0 : userAnswers.filter(answer => answer !== PLACEHOLDER).length / words.length) * 100} 
                />

                {/* Display the soft keyboard */}
                {showSoftKeyboard && (
                  <SoftKeyboard
                    onKeyPress={handleSoftKeyPress}
                    pressedKey={pressedKey}
                  />
                )}
              </Paper>

              {/* Update the Gauges container for better mobile display */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
                alignItems: 'center',
                justifyContent: 'space-around', 
                mb: 2,
                gap: 2 // Add gap between stacked items
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Total Time</Typography>
                  <Gauge
                    value={elapsedTime % 60}
                    valueMax={words.length * 30}
                    text={formatTime(elapsedTime)}
                    sx={{ 
                      width: { xs: 120, sm: 150 }, // Smaller on mobile
                      height: { xs: 120, sm: 150 }
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Current Word Time</Typography>
                  <Gauge
                    value={currentWordElapsedTime % 60}
                    valueMax={30}
                    text={formatTime(currentWordElapsedTime)}
                    sx={{ 
                      width: { xs: 120, sm: 150 }, // Smaller on mobile
                      height: { xs: 120, sm: 150 }
                    }}
                    startAngle={-90} 
                    endAngle={90}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}
    </DashboardLayout>
  );
}
