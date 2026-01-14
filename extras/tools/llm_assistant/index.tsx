import { ToolPlugin } from '../../../plugins/PluginInterface';
import { EditorView } from '@codemirror/view';

// Simple Icon Component
const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 2 2 2-2 2-2-2 2-2Z" />
        <path d="m5 6 3 4-3 4-3-4 3-4Z" />
        <path d="M15 16l-3 3-5-5-2-2 4-4 2 2 5 5 1-1Z" />
        <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
);

export const llmPlugin: ToolPlugin = {
    id: 'llm-assistant',
    name: 'LLM Assistant',
    version: '0.1.0',
    type: 'tool',
    icon: MagicWandIcon,
    tooltip: 'Ask AI (Assistant)',
    execute: async (view: EditorView) => {
        console.log('LLM Plugin Executed!');

        const state = view.state;
        const selection = state.selection.main;
        const selectedText = state.sliceDoc(selection.from, selection.to);

        if (!selectedText) {
            console.log('No text selected, inserting generic help...');
            const insertText = "\n[AI: Please select some text to ask about!]";
            view.dispatch({
                changes: { from: selection.to, insert: insertText }
            });
            return;
        }

        // Placeholder for actual LLM call
        const responseText = `\n\n(AI Assistant): I see you selected "${selectedText}". This is where the LLM response will go.`;

        view.dispatch({
            changes: { from: selection.to, insert: responseText },
            selection: { anchor: selection.to + responseText.length }
        });
    }
};

export default llmPlugin;
