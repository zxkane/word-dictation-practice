"use client";

import { useState, createContext } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
  ButtonGroup,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { grade3FirstSemester } from "@/utils/wordBank";
import { Female, Lightbulb, Male } from '@mui/icons-material';
import { 
  PlaySpeedOption, 
  PLAY_SPEEDS, 
  DEFAULT_PLAY_SPEED,
  STORAGE_KEYS, 
  VOICE_OPTIONS,
  DEFAULT_VOICE,
  type VoiceOption
} from "@/types/configuration";
import { 
  Speed,
  SlowMotionVideo,
  PlayArrow,
  FastForward 
} from '@mui/icons-material';
import { getStorageValue, setStorageValue } from '@/utils/storage';
import { School } from '@mui/icons-material';
import { Group } from '@mui/icons-material';

const drawerWidth = 240;

export const DrawerContext = createContext<{
  toggleDrawer: () => void;
  toggleSettings: () => void;
}>({ toggleDrawer: () => {}, toggleSettings: () => {} });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showHints, setShowHints] = useState(() => 
    getStorageValue(STORAGE_KEYS.SHOW_HINTS, false)
  );
  const [playTimes, setPlayTimes] = useState(() => 
    getStorageValue(STORAGE_KEYS.PLAY_TIMES, 2)
  );
  const [playSpeed, setPlaySpeed] = useState<PlaySpeedOption>(() =>  {
    const playSpeed = getStorageValue(STORAGE_KEYS.PLAY_SPEED, DEFAULT_PLAY_SPEED.value);
    return PLAY_SPEEDS.find(speed => speed.value === playSpeed) || DEFAULT_PLAY_SPEED;
  });
  const [playbackVoice, setPlaybackVoice] = useState<VoiceOption>(() => {
    const savedVoice = getStorageValue(STORAGE_KEYS.VOICE_GENDER, DEFAULT_VOICE.value);
    return VOICE_OPTIONS.find(voice => voice.value === savedVoice) || DEFAULT_VOICE;
  });

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handlePracticeClick = () => {
    setPracticeOpen(!practiceOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleShowHintsChange = (newValue: boolean) => {
    setShowHints(newValue);
    setStorageValue(STORAGE_KEYS.SHOW_HINTS, newValue);
  };

  const handlePlayTimesChange = (times: number) => {
    setPlayTimes(times);
    setStorageValue(STORAGE_KEYS.PLAY_TIMES, times);
  };

  const handlePlaySpeedChange = (speed: PlaySpeedOption) => {
    setPlaySpeed(speed);
    setStorageValue(STORAGE_KEYS.PLAY_SPEED, speed.value);
  };

  const handlePlaybackVoiceChange = (voice: VoiceOption) => {
    setPlaybackVoice(voice);
    setStorageValue(STORAGE_KEYS.VOICE_GENDER, voice.value);
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <School sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            English Dictation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            英语听写及打字练习
          </Typography>
        </Box>
      </Box>

      <List>
        <ListItem disablePadding>
          <ListItemButton href="/">
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="About"
              secondary="关于" 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handlePracticeClick}>
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Practice"
              secondary="练习" 
            />
            {practiceOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={practiceOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              href="/wordbank"
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText 
                primary={grade3FirstSemester.name}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <DrawerContext.Provider value={{ toggleDrawer, toggleSettings }}>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              English Dictation Practice
              <Typography variant="subtitle2" component="div">
                英语听写及打字练习
              </Typography>
            </Typography>
            <IconButton color="inherit" onClick={toggleSettings}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="right"
          open={settingsOpen}
          onClose={toggleSettings}
        >
          <Box sx={{ 
            width: { xs: '100%', sm: 468 }, 
            p: 3 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body1">
                Settings
                <Typography variant="body2" component="div">
                  设置
                </Typography>
              </Typography>
              <IconButton onClick={toggleSettings}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body1">
              Hints
              <Typography variant="body2" component="div">
                提示
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Button
                variant={showHints ? "contained" : "outlined"}
                onClick={() => handleShowHintsChange(!showHints)}
                color="primary"
                startIcon={<Lightbulb />}
              >
                Show Hints
              </Button>
            </Box>
            <Typography variant="body1" sx={{ mt: 3 }}>
              Utterance Play Times
              <Typography variant="body2" component="div">
                播放次数
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <ButtonGroup variant="outlined" aria-label="utterance play times">
                {[1, 2, 3, 4, 5].map((times) => (
                  <Button
                    key={times}
                    variant={playTimes === times ? "contained" : "outlined"}
                    onClick={() => handlePlayTimesChange(times)}
                    color="primary"
                  >
                    {times}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
            <Typography variant="body1" sx={{ mt: 3 }}>
              Playback Speed
              <Typography variant="body2" component="div">
                播放速度
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <ButtonGroup variant="outlined" aria-label="playback speed">
                {PLAY_SPEEDS.map((speed) => {
                  const getSpeedIcon = () => {
                    switch (speed.label) {
                      case 'slow':
                        return <SlowMotionVideo />;
                      case 'normal':
                        return <PlayArrow />;
                      case 'fast':
                        return <FastForward />;
                      default:
                        return <Speed />;
                    }
                  };

                  return (
                    <Button
                      key={speed.label}
                      variant={playSpeed.label === speed.label ? "contained" : "outlined"}
                      onClick={() => handlePlaySpeedChange(speed)}
                      color="primary"
                      startIcon={getSpeedIcon()}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {speed.label}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Box>
            <Typography variant="body1" sx={{ mt: 3 }}>
              Playback Voice
              <Typography variant="body2" component="div">
                播放声音
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <ButtonGroup variant="outlined" aria-label="playback voice">
                {VOICE_OPTIONS.map((voice) => {
                  const getVoiceIcon = () => {
                    switch (voice.label) {
                      case 'all':
                        return <Group />;
                      case 'male':
                        return <Male />;
                      case 'female':
                        return <Female />;
                      default:
                        return <Group />;
                    }
                  };

                  return (
                    <Button
                      key={voice.value}
                      variant={playbackVoice.value === voice.value ? "contained" : "outlined"}
                      onClick={() => handlePlaybackVoiceChange(voice)}
                      color="primary"
                      startIcon={getVoiceIcon()}
                      sx={{ 
                        textTransform: 'capitalize',
                        minWidth: '120px'
                      }}
                    >
                      {voice.description}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </Box>
          </Box>
        </Drawer>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8
          }}
        >
          {children}
        </Box>
      </Box>
    </DrawerContext.Provider>
  );
} 