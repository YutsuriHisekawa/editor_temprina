import { MutableRefObject } from "react";


export interface HandleEditorDidMountParams {
    editor: any;
    monaco: any;
    activeTabId: string | null;
    getFileContent: (id: string) => string;
    getLanguageFromFileId: (id: string) => string;
    editorRef: MutableRefObject<any>;
    monacoRef: MutableRefObject<any>;
    setIsEditorReady: (ready: boolean) => void;
}

export function handleEditorDidMount({
    editor,
    monaco,
    activeTabId,
    getFileContent,
    getLanguageFromFileId,
    editorRef,
    monacoRef,
    setIsEditorReady,
}: HandleEditorDidMountParams) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    try {
        monaco.editor.defineTheme("github-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                // Basic syntax
                { token: "delimiter.curly", foreground: "ffd700", fontStyle: "bold" },
                { token: "delimiter.bracket", foreground: "ffd700", fontStyle: "bold" },
                { token: "delimiter.parenthesis", foreground: "ffd700" },
                { token: "keyword.directive", foreground: "ff1493", fontStyle: "bold" },
                { token: "operator", foreground: "00ffff" },
                { token: "attribute.name", foreground: "00ff7f", fontStyle: "bold" },
                
                // Strings and Numbers
                { token: "string", foreground: "ffa500" },
                { token: "string.template", foreground: "a5d6ff" },
                { token: "number", foreground: "87ceeb" },
                { token: "number.float", foreground: "87ceeb" },
                { token: "number.hex", foreground: "87ceeb" },
                
                // Variables and Keywords
                { token: "variable", foreground: "da70d6" },
                { token: "variable.parameter", foreground: "da70d6" },
                { token: "keyword", foreground: "#ff69b4", fontStyle: "bold" },
                { token: "keyword.operator", foreground: "#00ffff" },
                { token: "keyword.flow", foreground: "#ff69b4", fontStyle: "bold" },
                
                // Functions and Parameters
                { token: "identifier.function", foreground: "#87ceeb" },
                { token: "parameter.name", foreground: "#e6e6fa" },
                { token: "arrow.function", foreground: "#00ffff", fontStyle: "bold" },
                
                // HTML/Vue/Blade specific
                { token: "tag", foreground: "48d1cc", fontStyle: "bold" },
                { token: "delimiter.bracket.embedding", foreground: "ff7b72" },
                { token: "meta.directive.vue", foreground: "ff7b72" },
                { token: "meta.tag.without-attributes.html", foreground: "c9d1d9" },
                { token: "meta.attribute.vue", foreground: "7ee787" },
                
                // Expression highlighting
                { token: "expression.arrow", foreground: "#00ffff", fontStyle: "bold" },
                { token: "expression.parameter", foreground: "#e6e6fa" },
                { token: "expression.brace", foreground: "#ffd700" },
                { token: "expression.content", foreground: "#f0f8ff" },
                { token: "meta.attribute-with-value.vue", foreground: "7ee787" },
                { token: "delimiter.interpolation.vue", foreground: "ff7b72" },
                { token: "expression.embbeded.vue", foreground: "79c0ff" },
                { token: "expression.property.vue", foreground: "7ee787" },
                { token: "delimiter.directive.vue", foreground: "ff7b72" },
                { token: "expression.ternary.vue", foreground: "ff7b72" },
                { token: "meta.embedded.expression.vue", foreground: "79c0ff" },
                { token: "meta.template.expression.vue", foreground: "79c0ff" },
                { token: "delimiter", foreground: "c9d1d9" },
                { token: "delimiter.bracket", foreground: "c9d1d9" },
                { token: "delimiter.parenthesis", foreground: "c9d1d9" },
                { token: "property", foreground: "7ee787" },
                { token: "property.readonly", foreground: "7ee787" },
                { token: "function", foreground: "00fa9a" },
                { token: "variable", foreground: "e6bf00" },
                { token: "variable.parameter", foreground: "dda0dd" },
                { token: "tag", foreground: "20b2aa" },
                { token: "attribute.name", foreground: "98fb98" },
                { token: "attribute.value", foreground: "ffa07a" },
                { token: "metatag", foreground: "48d1cc" },
                { token: "delimiter.blade", foreground: "ff69b4" },
                { token: "keyword.blade", foreground: "ff1493" },
                { token: "expression.blade", foreground: "00bfff" },
                { token: "variable.blade", foreground: "9370db" },
                { token: "expression.js", foreground: "79c0ff" },
                { token: "variable.js", foreground: "7ee787" },
                { token: "keyword.js", foreground: "ff7b72" },
                { token: "entity.other.attribute-name.html", foreground: "98fb98" },
                { token: "punctuation.separator.key-value.html", foreground: "00ffff" },
                { token: "punctuation.definition.string.begin.html", foreground: "ffd700" },
                { token: "punctuation.definition.string.end.html", foreground: "ffd700" },
                { token: "meta.embedded.expression.vue", foreground: "79c0ff" },
                { token: "meta.tag.attribute-value.vue", foreground: "7ee787" },
                { token: "meta.attribute-with-value.vue", foreground: "7ee787" },
                { token: "variable.other.readwrite.js", foreground: "7ee787" },
                { token: "keyword.operator.assignment.js", foreground: "ff7b72" },
                { token: "keyword.operator.comparison.js", foreground: "ff7b72" },
                { token: "constant.numeric.decimal.js", foreground: "79c0ff" },
                { token: "string.quoted.single.js", foreground: "a5d6ff" },
                { token: "meta.tag.custom.vue", foreground: "7ee787" },
                { token: "punctuation.definition.tag.begin.vue", foreground: "ff7b72" },
                { token: "punctuation.definition.tag.end.vue", foreground: "ff7b72" },
                { token: "type.identifier.php", foreground: "16a34a" },
                { token: "type.identifier.php.int", foreground: "22c55e" },
                { token: "type.identifier.php.float", foreground: "4ade80" },
                { token: "type.identifier.php.bool", foreground: "84cc16" },
                { token: "type.identifier.php.array", foreground: "65a30d" },
                { token: "type.identifier.php.object", foreground: "15803d" },
                { token: "type.identifier.php.callable", foreground: "059669" },
                { token: "type.identifier.php.void", foreground: "16a34a" },
                { token: "type.identifier.php.mixed", foreground: "22d3ee" },
                { token: "type.identifier.php.resource", foreground: "14b8a6" },
                { token: "type.identifier.php.iterable", foreground: "10b981" },
                { token: "type.identifier.php.self", foreground: "22c55e" },
                { token: "type.identifier.php.parent", foreground: "4ade80" },
            ],
            colors: {
                "editor.background": "#00000000",
                "editor.foreground": "#cdd6f4",
                "editor.lineHighlightBackground": "#313244",
                "editor.selectionBackground": "#585b70",
                "editor.inactiveSelectionBackground": "#45475a99",
                "editorCursor.foreground": "#fff",
                "editorWhitespace.foreground": "#6c7086",
                "editorIndentGuide.background": "#313244",
                "editorIndentGuide.activeBackground": "#cba6f7",
            },
        });
        monaco.editor.setTheme("github-dark");

        if (activeTabId) {
            const fileContent = getFileContent(activeTabId);
            const lang = getLanguageFromFileId(activeTabId);
            const uri = monaco.Uri.parse(activeTabId);
            let model = monaco.editor
                .getModels()
                .find((m: { uri: { toString: () => string } }) => m.uri.toString() === uri.toString());
            if (!model || model.isDisposed()) {
                model = monaco.editor.createModel(fileContent, lang, uri);
            } else {
                model.setValue(fileContent);
            }
            editor.setModel(model);
        }
    } catch (error) {
        console.error("Error in editor initialization:", error);
    }
    setIsEditorReady(true);
}
