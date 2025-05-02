
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  rows = 6,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[120px] p-3 rich-text-editor',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const minHeight = `${rows * 24}px`;

  return (
    <div className={`border rounded-md overflow-hidden bg-background ${className}`}>
      <div className="bg-muted/20 p-1 border-b">
        <div className="flex flex-wrap gap-1">
          <button 
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded-md ${editor?.isActive('bold') ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            <span className="font-bold">B</span>
          </button>
          <button 
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded-md ${editor?.isActive('italic') ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            <span className="italic">I</span>
          </button>
          <button 
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded-md ${editor?.isActive('heading', { level: 2 }) ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            <span className="font-bold">H2</span>
          </button>
          <button 
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded-md ${editor?.isActive('bulletList') ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            <span>• List</span>
          </button>
          <button 
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded-md ${editor?.isActive('orderedList') ? 'bg-muted' : 'hover:bg-muted'}`}
          >
            <span>1. List</span>
          </button>
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        style={{ minHeight }}
        className="p-0"
      />
      {!editor?.getText() && (
        <div className="absolute top-[2.5rem] left-3 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
