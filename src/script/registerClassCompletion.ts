/**
 * Register Monaco completion provider for class/className attributes.
 * @param monaco Monaco instance
 * @param lang Language id
 * @param suggestions Array of CompletionItem (Tailwind, custom, etc)
 */
function registerClassCompletion(monaco: any, lang: string, suggestions: any[]) {
    monaco.languages.registerCompletionItemProvider(lang, {
        triggerCharacters: [' ', '"', '\'', '-', '[', ']', ':'],
        provideCompletionItems: (model: any, position: any) => {
            // Ambil seluruh isi dokumen
            const fullText = model.getValue();
            const offset = model.getOffsetAt(position);
            // Regex global untuk semua attribute class/className di dokumen
            const attrRegex = /(class(?:Name)?\s*=\s*)(["'])([^"']*)/g;
            let match;
            let inClassAttr = false;
            let attrValue = '';
            let valueStart = 0;
            while ((match = attrRegex.exec(fullText)) !== null) {
                // Cari posisi value di dokumen
                const matchStart = match.index;

                // Posisi value (isi di dalam tanda kutip)
                const valStart = matchStart + match[1].length + 1; // +1 untuk opening quote
                const valEnd = valStart + match[3].length;
                if (offset >= valStart && offset <= valEnd) {
                    inClassAttr = true;
                    attrValue = match[3];
                    valueStart = valStart;
                    break;
                }
            }
            if (!inClassAttr) return { suggestions: [] };
            // Ambil kata sebelum kursor di dalam value
            const relativeCursor = offset - valueStart;
            // Ambil value sebelum kursor (bisa ada spasi, misal: "bg-white text-")
            const valueBeforeCursor = attrValue.slice(0, relativeCursor);
            // Ambil kata terakhir setelah spasi atau awal string
            const wordMatch = valueBeforeCursor.match(/(?:^|\s)([a-zA-Z0-9\-\[\]:]*)$/);
            const currentWord = wordMatch ? wordMatch[1] : '';
            // Dapatkan posisi range untuk kata yang sedang diketik
            // (wordStart tidak dipakai)
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - currentWord.length,
                endColumn: position.column
            };
            // Augment setiap suggestion dengan property range
            const filtered = (filteredArr => filteredArr.length ? filteredArr : suggestions)
                (suggestions.filter(s => s.label.startsWith(currentWord)));
            const withRange = filtered.map(s => ({ ...s, range }));
            return { suggestions: withRange };
        },
    });
}
export default registerClassCompletion;
