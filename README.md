# CopyPasteEditor: Google Docs to Markdown Converter

A React application that converts formatted content from Google Docs (and other rich text sources) to Markdown format using clipboard MIME types.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Understanding Clipboard MIME Types](#understanding-clipboard-mime-types)
- [HTML to Markdown Conversion](#html-to-markdown-conversion)
- [Implementation Details](#implementation-details)
- [Getting Started](#getting-started)
- [Development](#development)

## Overview

CopyPasteEditor is a web application that allows users to paste rich text content (particularly from Google Docs) and automatically converts it to Markdown format. The application leverages the clipboard API to access HTML content and transforms it into clean, portable Markdown.

## Features

- Paste formatted content from Google Docs and other rich text editors
- Automatic conversion to Markdown format
- Real-time preview of the converted Markdown
- Support for various formatting elements:
  - Headings (H1-H6)
  - Bold, italic, underline, and strikethrough text
  - Ordered and unordered lists
  - Links and images
  - Blockquotes
  - Code blocks
  - And more

## Understanding Clipboard MIME Types

### What are MIME Types?

MIME (Multipurpose Internet Mail Extensions) types are labels used to identify the format of data. When you copy content to your clipboard, the system stores that content in multiple formats, each identified by a MIME type.

### Clipboard Data Structure

When you copy content from an application like Google Docs, the clipboard doesn't just store plain text. Instead, it stores multiple representations of the same content in different formats, including:

- `text/plain`: Simple unformatted text
- `text/html`: HTML representation with formatting
- Application-specific formats (e.g., `application/x-vnd.google-docs-document-slice-clip+wrapped`)

### How This Application Uses MIME Types

This application intercepts paste events and examines the clipboard data for different MIME types:

1. First, it checks for `text/html` content, which preserves formatting
2. If HTML content is available, it converts it to Markdown
3. If HTML is not available, it falls back to `text/plain`

The application also logs Google Docs-specific MIME types for debugging purposes:
- `application/x-vnd.google-docs-document-slice-clip+wrapped`
- `application/x-vnd.google-docs-internal-clip-id`

### Understanding `application/x-vnd.google-docs-document-slice-clip+wrapped`

This MIME type is specific to Google Docs and contains a proprietary format that preserves the rich formatting and structure of content copied from Google Docs documents.

#### Format Structure

The `application/x-vnd.google-docs-document-slice-clip+wrapped` format:

1. **Proprietary Encoding**: Contains Google's internal representation of document content
2. **Binary Data**: Typically encoded as a base64 string within a JSON wrapper
3. **Complete Formatting**: Preserves all formatting, styles, and document-specific metadata
4. **Vendor-Specific**: The `x-vnd` prefix indicates it's a vendor-specific format (Google)

#### Why It Matters

This format is important for several reasons:

- **Lossless Copy/Paste**: When pasting back into Google Docs, this format ensures perfect preservation of all formatting and styles
- **Document Context**: Contains information about the source document and context of the copied content
- **Advanced Features**: Preserves Google Docs-specific features that don't exist in standard HTML (comments, suggestions, etc.)
- **Version Information**: May include document version data for tracking purposes

#### How It's Used

While our application doesn't directly parse this format (we use the `text/html` representation instead), understanding its presence helps with:

1. **Debugging**: Identifying when content comes specifically from Google Docs
2. **Feature Development**: Potential future enhancements could leverage this data
3. **Compatibility**: Ensuring our application handles Google Docs content correctly

The format is wrapped (`+wrapped` suffix) which indicates it contains additional metadata beyond just the document slice itself.

### Code Example

```typescript
const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  // Prevent the default paste behavior
  e.preventDefault();

  // Get clipboard data
  const clipboardData = e.clipboardData;

  // Try to get HTML content first
  let content = clipboardData.getData("text/html");
  
  if (content) {
    // Convert HTML to Markdown
    const markdown = convertHtmlToMarkdown(content);
    // Insert the markdown at cursor position
    // ...
  } else {
    // Fallback to plain text if HTML is not available
    content = clipboardData.getData("text/plain");
    // Insert the plain text at cursor position
    // ...
  }
};
```

## HTML to Markdown Conversion

### Conversion Process

The application converts HTML to Markdown through these steps:

1. Parse the HTML content into a DOM structure
2. Recursively process each node in the DOM tree
3. Apply specific conversion rules based on element types and styles
4. Generate equivalent Markdown syntax

### Supported Conversions

The converter handles various HTML elements and styles:

| HTML Element/Style | Markdown Equivalent |
|--------------------|---------------------|
| `<h1>` to `<h6>` | `#` to `######` |
| `<strong>`, `<b>` | `**bold**` |
| `<em>`, `<i>` | `*italic*` |
| `<s>`, `<del>` | `~~strikethrough~~` |
| `<a href="...">` | `[link text](url)` |
| `<ul>`, `<li>` | `- list item` |
| `<ol>`, `<li>` | `1. list item` |
| `<blockquote>` | `> quoted text` |
| `<code>` | `` `code` `` |
| `<pre>` | ` ```code block``` ` |
| `<img>` | `![alt text](image url)` |

### Implementation Highlights

The conversion is implemented through a recursive function that processes each node in the HTML tree:

```typescript
const processNode = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const style = element.style;
    const children = Array.from(element.childNodes)
      .map(processNode)
      .join("");

    // Handle different HTML elements and styles
    switch (tagName) {
      case "h1":
        return `# ${children}\n\n`;
      case "strong":
      case "b":
        return `**${children}**`;
      // ... other element handlers
    }
  }

  return "";
};
```

## Implementation Details

### Project Structure

This project is built with:
- React 19
- TypeScript
- Vite as the build tool
- react-markdown for rendering the preview

### Key Components

1. **Paste Handler**: Intercepts paste events and extracts HTML content from the clipboard
2. **HTML to Markdown Converter**: Transforms HTML into equivalent Markdown syntax
3. **Editor Interface**: Split-screen UI with editor and preview panes
4. **Markdown Renderer**: Uses react-markdown to render the preview

### Core Functionality

The main functionality is implemented in `App.tsx` with these key functions:

- `handlePaste`: Intercepts paste events and processes clipboard data
- `convertHtmlToMarkdown`: Transforms HTML content to Markdown
- `processNode`: Recursively processes HTML nodes and applies conversion rules

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/copy-paste-editor.git

# Navigate to the project directory
cd copy-paste-editor

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm run dev
```

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Run ESLint to check for code issues
- `npm run preview`: Preview the production build locally
