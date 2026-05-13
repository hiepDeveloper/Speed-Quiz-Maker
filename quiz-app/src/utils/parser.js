export const parseQuizText = (text) => {
  const questions = [];
  // Split by "câu [number]:" but keep the delimiter or use a better regex
  const blocks = text.split(/câu \d+:/i).filter(b => b.trim() !== "");
  
  // Need to handle the numbers if they are important, but usually index is fine
  // Let's re-split to include the "câu n:" text if we want the actual number
  const regex = /câu (\d+):([\s\S]*?)(?=câu \d+:|$)/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const id = match[1];
    const content = match[2].trim();
    
    // Split lines
    const lines = content.split('\n').map(l => l.trim()).filter(l => l !== "");
    const questionText = lines[0];
    const options = lines.slice(1).map(opt => {
      const isCorrect = opt.startsWith('*');
      // Remove '*' and the label (A., B., etc.) if needed, or keep it.
      // Usually, we want the text after the label.
      const labelMatch = opt.match(/^\*?([A-D])\.\s?(.*)$/i);
      if (labelMatch) {
        return {
          label: labelMatch[1].toUpperCase(),
          text: labelMatch[2],
          isCorrect
        };
      }
      return null;
    }).filter(o => o !== null);

    questions.push({
      id,
      question: questionText,
      options
    });
  }
  
  return questions;
};
