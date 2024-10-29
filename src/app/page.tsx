"use client";

import { useState } from "react";
import { Typography, List, ListItem, ListItemText, Checkbox, Button, Box } from "@mui/material";
import { grade3FirstSemester } from "@/utils/wordBank";
import PageLayout from "@/components/PageLayout";

export default function Home() {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const handleToggle = (unitId: string) => () => {
    const currentIndex = selectedUnits.indexOf(unitId);
    const newChecked = [...selectedUnits];

    if (currentIndex === -1) {
      newChecked.push(unitId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedUnits(newChecked);
  };

  const startDictationPractice = () => {
    // Navigate to dictation page with selected units
    window.location.href = `/dictation?units=${selectedUnits.join(",")}&wordBankId=${grade3FirstSemester.id}`;
  };

  return (
    <PageLayout>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          mb: 4
        }}
      >
        Word Bank: {grade3FirstSemester.name}
      </Typography>

      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          textAlign: 'center',
          mb: 3
        }}
      >
        Select Units to Practice:
      </Typography>

      <List sx={{ 
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        mb: 4
      }}>
        {grade3FirstSemester.units.map((unit) => (
          <ListItem 
            key={unit.id} 
            onClick={handleToggle(unit.id)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
              transition: 'background-color 0.2s'
            }}
          >
            <Checkbox
              edge="start"
              checked={selectedUnits.indexOf(unit.id) !== -1}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText 
              primary={unit.name} 
              secondary={unit.description}
              primaryTypographyProps={{
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={startDictationPractice}
          disabled={selectedUnits.length === 0}
          sx={{ 
            minWidth: 200,
            py: 1.5
          }}
        >
          Start Practice
        </Button>
      </Box>
    </PageLayout>
  );
}
