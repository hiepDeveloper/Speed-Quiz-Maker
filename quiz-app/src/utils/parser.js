export const parseQuizText = (text) => {
  const questions = [];
  
  // Use a more robust way to split questions: Look for "Câu [number]:" at the start of a line
  // We use a regex that captures the number and the content until the next "Câu"
  const questionRegex = /(?:^|\n)Câu\s+(\d+)\s*:\s*([\s\S]*?)(?=\nCâu\s+\d+\s*:|$)/gi;
  
  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    const id = match[1];
    const content = match[2].trim();
    
    // Split lines and clean up
    const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "");
    if (lines.length < 2) continue; // Skip if no options

    const questionText = lines[0];
    const options = lines.slice(1).map(line => {
      // Pattern: optional *, then A/B/C/D, then . or ), then the text
      const optionMatch = line.match(/^(\*)?\s*([A-D])\s*[\.\)]\s*(.*)$/i);
      if (optionMatch) {
        return {
          label: optionMatch[2].toUpperCase(),
          text: optionMatch[3].trim(),
          isCorrect: !!optionMatch[1]
        };
      }
      return null;
    }).filter(opt => opt !== null);

    if (options.length > 0) {
      questions.push({
        id,
        question: questionText,
        options
      });
    }
  }

  // Fallback for different formats (e.g. lowercase "câu")
  if (questions.length === 0) {
    const fallbackRegex = /(?:^|\n)câu\s+(\d+)\s*:\s*([\s\S]*?)(?=\ncâu\s+\d+\s*:|$)/gi;
    while ((match = fallbackRegex.exec(text)) !== null) {
      const id = match[1];
      const content = match[2].trim();
      const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "");
      if (lines.length < 2) continue;

      const questionText = lines[0];
      const options = lines.slice(1).map(line => {
        const optionMatch = line.match(/^(\*)?\s*([A-D])\s*[\.\)]\s*(.*)$/i);
        if (optionMatch) {
          return {
            label: optionMatch[2].toUpperCase(),
            text: optionMatch[3].trim(),
            isCorrect: !!optionMatch[1]
          };
        }
        return null;
      }).filter(opt => opt !== null);

      if (options.length > 0) {
        questions.push({
          id,
          question: questionText,
          options
        });
      }
    }
  }
  
  return questions;
};
