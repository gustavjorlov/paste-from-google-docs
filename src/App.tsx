import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const convertHtmlToMarkdown = (html: string): string => {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Process the HTML and convert to Markdown
    let markdown = "";

    // Process the nodes recursively
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
          case "h2":
            return `## ${children}\n\n`;
          case "h3":
            return `### ${children}\n\n`;
          case "h4":
            return `#### ${children}\n\n`;
          case "h5":
            return `##### ${children}\n\n`;
          case "h6":
            return `###### ${children}\n\n`;
          case "p":
            return `${children}\n\n`;
          case "strong":
          case "b":
            return `**${children}**`;
          case "em":
          case "i":
            return `*${children}*`;
          case "u":
            return `<u>${children}</u>`;
          case "strike":
          case "s":
          case "del":
            return `~~${children}~~`;
          case "a": {
            const href = element.getAttribute("href");
            return `[${children}](${href})`;
          }
          case "ul":
            return `${children}\n`;
          case "ol":
            return `${children}\n`;
          case "li": {
            // Check if parent is OL or UL
            const parent = element.parentElement;
            if (parent && parent.tagName.toLowerCase() === "ol") {
              return `1. ${children}\n`;
            }
            return `- ${children}\n`;
          }
          case "blockquote":
            return `> ${children}\n\n`;
          case "code":
            return `\`${children}\``;
          case "pre":
            return `\`\`\`\n${children}\n\`\`\`\n\n`;
          case "br":
            return "\n";
          case "hr":
            return "---\n\n";
          case "img": {
            const src = element.getAttribute("src");
            const alt = element.getAttribute("alt") || "";
            return `![${alt}](${src})`;
          }
          case "span": {
            // Handle inline styles
            let styledText = children;

            // Bold
            if (
              style.fontWeight === "bold" ||
              parseInt(style.fontWeight || "0") >= 700
            ) {
              styledText = `**${styledText}**`;
            }

            // Italic
            if (style.fontStyle === "italic") {
              styledText = `*${styledText}*`;
            }

            // Strikethrough
            if (style.textDecoration === "line-through") {
              styledText = `~~${styledText}~~`;
            }

            // Underline - HTML since Markdown doesn't support underline
            if (style.textDecoration === "underline") {
              styledText = `<u>${styledText}</u>`;
            }

            return styledText;
          }
          default:
            return children;
        }
      }

      return "";
    };

    // Process all top-level nodes
    for (const node of Array.from(tempDiv.childNodes)) {
      markdown += processNode(node);
    }

    return markdown;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get clipboard data
    const clipboardData = e.clipboardData;

    // Try to get HTML content first
    let content = clipboardData.getData("text/html");

    console.log(content);

    if (content) {
      // Convert HTML to Markdown
      const markdown = convertHtmlToMarkdown(content);

      // Insert the markdown at the current cursor position
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      const newText =
        text.substring(0, selectionStart) +
        markdown +
        text.substring(selectionEnd);

      setText(newText);
    } else {
      // Fallback to plain text if HTML is not available
      content = clipboardData.getData("text/plain");

      // Insert the plain text at the current cursor position
      const textarea = e.currentTarget;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      const newText =
        text.substring(0, selectionStart) +
        content +
        text.substring(selectionEnd);

      setText(newText);
    }
  };

  return (
    <div className="app-container">
      <h1>Google Docs to Markdown Converter</h1>
      <div className="text-area-container">
        <textarea
          value={text}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="Paste content from Google Docs here..."
          rows={10}
          cols={50}
          className="text-area"
        />
      </div>
      <div className="character-count">Character count: {text.length}</div>
      <div className="instructions">
        <p>
          Copy content from Google Docs and paste it here to convert formatting
          to Markdown.
        </p>
        <p>
          Supported formatting: <strong>bold</strong>, <em>italic</em>,{" "}
          <u>underline</u>, <s>strikethrough</s>, headings, lists, links, and
          more.
        </p>
      </div>
    </div>
  );
}

export default App;
