
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Underline as UnderlineIcon, List, Link as LinkIcon, Heading, IndentIncrease, IndentDecrease } from 'lucide-react';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

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
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState<boolean>(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        }
      }),
      Underline,
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

  const setLink = () => {
    if (!linkUrl) {
      // Remove the link - fixed method name to match TipTap API
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    // Check if the URL starts with http:// or https://
    let url = linkUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Set the link with the correct API
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  // Function to check if indent increase is possible
  const canIndent = () => {
    if (!editor) return false;
    return editor.can().sinkListItem('listItem');
  };

  // Function to check if outdent is possible
  const canOutdent = () => {
    if (!editor) return false;
    return editor.can().liftListItem('listItem');
  };

  return (
    <div className={`border rounded-md overflow-hidden bg-background ${className}`}>
      <div className="bg-muted/20 p-1 border-b flex flex-wrap gap-1">
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1 rounded-md ${editor?.isActive('bold') ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1 rounded-md ${editor?.isActive('italic') ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded-md ${editor?.isActive('underline') ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded-md ${editor?.isActive('heading', { level: 2 }) ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Heading"
        >
          <Heading className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded-md ${editor?.isActive('bulletList') ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded-md ${editor?.isActive('orderedList') ? 'bg-muted' : 'hover:bg-muted'}`}
          title="Ordered List"
        >
          <List className="h-4 w-4" />
        </button>
        <div className="relative">
          {showLinkInput ? (
            <div className="flex absolute top-0 left-0 z-10 bg-background border p-1 rounded-md shadow-md">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL"
                className="text-sm p-1 w-40 border rounded-md"
                autoFocus
              />
              <button 
                type="button"
                onClick={setLink}
                className="p-1 ml-1 text-sm bg-primary text-white rounded-md"
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => setShowLinkInput(false)}
                className="p-1 ml-1 text-sm bg-muted rounded-md"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => {
                setLinkUrl(editor?.getAttributes('link').href || '');
                setShowLinkInput(true);
              }}
              className={`p-1 rounded-md ${editor?.isActive('link') ? 'bg-muted' : 'hover:bg-muted'}`}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().liftListItem('listItem').run()}
          className={`p-1 rounded-md hover:bg-muted ${!canOutdent() ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Decrease Indent"
          disabled={!canOutdent()}
        >
          <IndentDecrease className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}
          className={`p-1 rounded-md hover:bg-muted ${!canIndent() ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Increase Indent"
          disabled={!canIndent()}
        >
          <IndentIncrease className="h-4 w-4" />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        style={{ minHeight }}
        className="p-0"
      />
      {editor && !editor.getText() && (
        <div className="absolute top-[2.5rem] left-3 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
