import { useEffect, useState } from "react";

export function useTypewriter(words) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!words.length) return undefined;

    const word = words[wordIdx];

    if (typing) {
      if (displayed.length < word.length) {
        const timeoutId = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(timeoutId);
      }

      const timeoutId = setTimeout(() => setTyping(false), 1800);
      return () => clearTimeout(timeoutId);
    }

    if (displayed.length > 0) {
      const timeoutId = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      return () => clearTimeout(timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setWordIdx((index) => (index + 1) % words.length);
      setTyping(true);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [displayed, typing, wordIdx, words]);

  return displayed;
}
