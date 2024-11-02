"use client";

import { useState } from "react";
import { Typography, List, ListItem, ListItemText, Checkbox, Button, Box, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { grade3FirstSemester } from "@/utils/wordBank";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from 'next/navigation';

export default function WordBankPage() {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const router = useRouter();

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
      wordBankId: grade3FirstSemester.id
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
            {grade3FirstSemester.name}
          </Typography>
        </Breadcrumbs>

        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {grade3FirstSemester.units.map((unit) => (
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
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
} 