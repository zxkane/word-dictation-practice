"use client";

import { useState } from "react";
import { Typography, List, ListItem, ListItemText, Checkbox, Button, Box, Breadcrumbs, Link, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { getWordBank, getWordBankPath } from "@/utils/wordBank";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from 'next/navigation';
import { WordBank } from "@/types/wordBank";

// Add search params type
type SearchParams = {
  wordBankId: string;
}

// Update component to accept search params
export default function WordBankPage({ searchParams }: { searchParams: SearchParams }) {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const router = useRouter();

  // Get wordbank from ID instead of using hardcoded one
  const wordBank: WordBank = getWordBank(getWordBankPath(searchParams.wordBankId));

  const handleUnitToggle = (unitName: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitName)
        ? prev.filter(name => name !== unitName)
        : [...prev, unitName]
    );
  };

  const startDictationPractice = () => {
    const queryParams = new URLSearchParams({
      units: selectedUnits.join(','),
      wordBankId: searchParams.wordBankId
    });
    router.push(`/dictation?${queryParams.toString()}`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="/"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary">
            Practice
          </Typography>
          <Typography color="text.primary">
            {wordBank.name}
          </Typography>
        </Breadcrumbs>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {wordBank.units.map((unit) => (
              <ListItem key={unit.id}>
                <Checkbox 
                  checked={selectedUnits.includes(unit.id)}
                  onChange={() => handleUnitToggle(unit.id)}
                />
                <ListItemText 
                  primary={`${unit.name} - ${unit.description}`}
                  secondary={`${unit.words.length} words`}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={startDictationPractice}
              disabled={selectedUnits.length === 0}
            >
              Start Practice
              <Typography variant="caption" display="block" sx={{ fontSize: '0.7em' }}>
                开始练习
              </Typography>
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
} 