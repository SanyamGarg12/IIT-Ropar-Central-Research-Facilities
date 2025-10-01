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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '' });

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
    // Ensure editor is focused before opening modal
    if (editorRef.current) {
      editorRef.current.focus();
    }
    setShowLinkModal(true);
  };

  const handleLinkSubmit = () => {
    if (linkData.url && linkData.text) {
      // Focus the editor first
      if (editorRef.current) {
        editorRef.current.focus();
        
        // Create the link HTML
        const linkHTML = `<a href="${linkData.url}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;
        
        try {
          // Try using execCommand first
          const success = document.execCommand('insertHTML', false, linkHTML);
          
          if (!success) {
            // Fallback: insert at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = linkHTML;
              const linkNode = tempDiv.firstChild;
              range.insertNode(linkNode);
              range.setStartAfter(linkNode);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
          
          // Trigger input event to update the value
          handleInput();
        } catch (error) {
          console.error('Error inserting link:', error);
          // Fallback: append to end of content
          if (editorRef.current) {
            editorRef.current.innerHTML += linkHTML;
            handleInput();
          }
        }
      }
    }
    setShowLinkModal(false);
    setLinkData({ url: '', text: '' });
  };

  const handleColorSelect = (color) => {
    execCommand('foreColor', color);
    setShowColorModal(false);
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
    { label: '🎨', command: 'foreColor', title: 'Text Color', custom: () => setShowColorModal(true) },
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

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  placeholder="Enter display text for the link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkData({ url: '', text: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Selection Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Text Color</h3>
            <div className="grid grid-cols-6 gap-3">
              {[
                { name: 'Black', value: '#000000' },
                { name: 'Red', value: '#dc2626' },
                { name: 'Orange', value: '#ea580c' },
                { name: 'Yellow', value: '#ca8a04' },
                { name: 'Green', value: '#16a34a' },
                { name: 'Blue', value: '#2563eb' },
                { name: 'Purple', value: '#9333ea' },
                { name: 'Pink', value: '#db2777' },
                { name: 'Gray', value: '#6b7280' },
                { name: 'Brown', value: '#92400e' },
                { name: 'Teal', value: '#0d9488' },
                { name: 'Indigo', value: '#4f46e5' },
                { name: 'Cyan', value: '#0891b2' },
                { name: 'Lime', value: '#65a30d' },
                { name: 'Amber', value: '#d97706' },
                { name: 'Rose', value: '#e11d48' },
                { name: 'Violet', value: '#7c3aed' },
                { name: 'Emerald', value: '#059669' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowColorModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
