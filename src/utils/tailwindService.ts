// utils/tailwindService.ts
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

let processor: any;

export async function initializeTailwindService() {
  processor = postcss([
    tailwindcss({
      content: [{ raw: '' }],
      theme: { extend: {} },
      plugins: [],
    }),
  ]);
}

export function getTailwindSuggestions(content: string) {
  if (!processor) {
    console.error('Tailwind processor is not initialized.');
    return [];
  }

  try {
    const result = processor.process(content, { from: undefined });
    // Extract suggestions from the result if needed
    return result.css.split(/\s+/).filter(Boolean); // Example: split by whitespace
  } catch (error) {
    console.error('Error processing Tailwind content:', error);
    return [];
  }
}