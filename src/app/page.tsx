"use client";

import { useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, Checkbox, Button } from "@mui/material";
import { grade3FirstSemester } from "@/utils/wordBank";

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
    <Container>
      <Typography variant="h4" gutterBottom>
        Word Bank: {grade3FirstSemester.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Units:
      </Typography>
      <List>
        {grade3FirstSemester.units.map((unit) => (
          <ListItem key={unit.id} onClick={handleToggle(unit.id)}>
            <Checkbox
              edge="start"
              checked={selectedUnits.indexOf(unit.id) !== -1}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={unit.name} secondary={unit.description} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={startDictationPractice}
        disabled={selectedUnits.length === 0}
      >
        Start Dictation Practice
      </Button>
    </Container>
  );
}
