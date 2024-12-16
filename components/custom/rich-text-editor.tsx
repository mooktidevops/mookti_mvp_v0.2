// ./components/custom/RichTextEditor.tsx

// import Document from '@tiptap/extension-document';
// import Paragraph from '@tiptap/extension-paragraph';
// import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import React from 'react';

import { EditorToolbar } from './editor-toolbar'; // Assuming you've created an EditorToolbar component

type RichTextEditorProps = {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      // Document,
      // Paragraph,
      // Text,
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="w-full min-w-0 border border-gray-300 rounded-md">
      <div className="flex flex-wrap items-center border-b border-gray-200 p-2 gap-2 rounded-t-md">
      </div>
      <div className="relative p-2 overflow-hidden">
        <EditorContent
          editor={editor}
          className="prose w-full min-w-0 max-w-full focus:outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}