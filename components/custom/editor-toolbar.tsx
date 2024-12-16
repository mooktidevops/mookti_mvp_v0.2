// ./components/custom/editor-toolbar.tsx
import { Editor } from '@tiptap/react';
import React from 'react';


interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    `px-2 py-1 border rounded text-sm ${
      isActive ? 'bg-gray-300 text-gray-900' : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <em>I</em>
      </button>

      {/* Heading Level 1 */}
      <button
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        H1
      </button>

      {/* Heading Level 2 */}
      <button
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        H2
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        • List
      </button>

      {/* Ordered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        1. List
      </button>

      {/* Code Block */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        {'</>'}
      </button>

      {/* Undo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className={buttonClass(false)}
        title="Undo"
      >
        Undo
      </button>

      {/* Redo */}
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className={buttonClass(false)}
        title="Redo"
      >
        Redo
      </button>
    </div>
  );
}