import React, { useRef, useEffect, useState } from 'react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  name, 
  disabled = false,
  height = '200px'
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange({
        target: {
          name: name,
          value: editorRef.current.innerHTML
        }
      });
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatBlock = (tag) => {
    execCommand('formatBlock', `<${tag}>`);
  };

  const toolbarButtons = [
    { label: 'B', command: 'bold', title: 'Bold' },
    { label: 'I', command: 'italic', title: 'Italic' },
    { label: 'U', command: 'underline', title: 'Underline' },
    { label: 'S', command: 'strikeThrough', title: 'Strikethrough' },
    { type: 'separator' },
    { label: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { label: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { type: 'separator' },
    { label: '•', command: 'insertUnorderedList', title: 'Bullet List' },
    { label: '1.', command: 'insertOrderedList', title: 'Numbered List' },
    { type: 'separator' },
    { label: '←', command: 'outdent', title: 'Decrease Indent' },
    { label: '→', command: 'indent', title: 'Increase Indent' },
    { type: 'separator' },
    { label: '🔗', command: 'link', title: 'Insert Link', custom: insertLink },
    { label: '🎨', command: 'foreColor', title: 'Text Color', custom: () => {
      const color = prompt('Enter color (e.g., red, #ff0000):');
      if (color) execCommand('foreColor', color);
    }},
    { type: 'separator' },
    { label: '🧹', command: 'removeFormat', title: 'Clear Formatting' },
  ];

  return (
    <div className="rich-text-editor-container">
      {/* Toolbar */}
      <div className="rich-text-toolbar">
        {toolbarButtons.map((button, index) => (
          <React.Fragment key={index}>
            {button.type === 'separator' ? (
              <div className="toolbar-separator" />
            ) : (
              <button
                type="button"
                className="toolbar-button"
                title={button.title}
                onClick={() => {
                  if (button.custom) {
                    button.custom();
                  } else if (button.value) {
                    execCommand(button.command, button.value);
                  } else {
                    execCommand(button.command);
                  }
                }}
                disabled={disabled}
              >
                {button.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className={`rich-text-editor ${isFocused ? 'focused' : ''}`}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        style={{ 
          minHeight: height,
          height: height,
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
