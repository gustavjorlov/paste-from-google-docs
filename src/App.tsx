import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [text, setText] = useState("");
  const [rawHtml, setRawHtml] = useState("");
  const [readmeContent, setReadmeContent] = useState("");

  useEffect(() => {
    // Fetch the README.md content
    fetch("/README.md")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch README.md");
        }
        return response.text();
      })
      .then((content) => {
        setReadmeContent(content);
      })
      .catch((error) => {
        console.error("Error fetching README.md:", error);
        // Try alternative path if the first attempt fails
        fetch("./README.md")
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Failed to fetch README.md from alternative path"
              );
            }
            return response.text();
          })
          .then((content) => {
            setReadmeContent(content);
          })
          .catch((altError) => {
            console.error(
              "Error fetching README.md from alternative path:",
              altError
            );
            setReadmeContent(
              "Failed to load README.md content. Please make sure the file exists in the public directory."
            );
          });
      });
  }, []);

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
            console.log(element.parentElement?.tagName.toLowerCase());
            if (element.parentElement?.tagName.toLowerCase() === "div") {
              return children;
            }
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
              return `1. ${children}`;
            }
            return `- ${children}`;
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
          case "table": {
            // Check if there's a caption
            const caption = element.querySelector("caption");
            const captionText = caption
              ? `*Table: ${caption.textContent}*\n\n`
              : "";
            return `${captionText}${children}\n\n`;
          }
          case "caption": {
            // Skip caption as it's handled in the table case
            return "";
          }
          case "thead": {
            return children;
          }
          case "tbody": {
            if (element.parentNode?.querySelector("thead")) {
              return children;
            } else {
              const numberColumns =
                element.querySelector("tr")?.children.length || 0;
              return `${new Array(numberColumns + 1)
                .fill(0)
                .map(() => "|")
                .join("")}\n${new Array(numberColumns + 1)
                .fill(0)
                .map(() => "|")
                .join("-")}\n${children}`;
            }
          }
          case "tr": {
            // Check if this is the first row (header row)
            const parent = element.parentElement;
            const isHeaderRow =
              parent && parent.tagName.toLowerCase() === "thead";

            // Ensure row starts with pipe character
            // If children already starts with a pipe (due to nested processing), don't add another
            const rowContent = children.trim().startsWith("|")
              ? children.trim()
              : `|${children.trim()}`;

            // If this is a header row, add a separator row after it
            if (isHeaderRow) {
              // Get all header cells
              const headerCells = Array.from(element.children);

              // Create separator with alignment
              const separators = headerCells.map((cell) => {
                const style = (cell as HTMLElement).style;
                const textAlign = style.textAlign;

                if (textAlign === "center") return ":---:";
                if (textAlign === "right") return "---:";
                return ":---"; // Default to left align
              });

              return `${rowContent}\n| ${separators.join(" | ")} |\n`;
            }

            return `${rowContent}\n`;
          }
          case "th": {
            // Get colspan if it exists
            const colspan = parseInt(element.getAttribute("colspan") || "1");
            const content = children.trim() || " "; // Ensure empty cells have at least a space

            if (colspan > 1) {
              // For cells with colspan, add multiple cells
              return ` ${content} |${" | ".repeat(colspan - 1)}`;
            }

            // For header cells, return the content with pipe separators
            return ` ${content} |`;
          }
          case "td": {
            // Get colspan if it exists
            const colspan = parseInt(element.getAttribute("colspan") || "1");
            const content = children.trim() || " "; // Ensure empty cells have at least a space

            if (colspan > 1) {
              // For cells with colspan, add multiple cells
              return ` ${content} |${" | ".repeat(colspan - 1)}`;
            }

            // For data cells, return the content with pipe separators
            return ` ${content} |`;
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
    const googledata = clipboardData.getData(
      "application/x-vnd.google-docs-document-slice-clip+wrapped"
    );

    console.log(content);
    console.log(googledata);

    // Store the raw HTML for display
    setRawHtml(content || "No HTML content in clipboard");

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
      <div className="editor-container">
        <div className="text-area-container">
          <h2>Markdown Editor</h2>
          <textarea
            value={text}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="Paste content from Google Docs here..."
            rows={20}
            className="text-area"
          />
          <div className="character-count">Character count: {text.length}</div>
        </div>
        <div className="preview-container">
          <h2>Preview</h2>
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="instructions">
        <p>
          Copy content from Google Docs and paste it here to convert formatting
          to Markdown.
        </p>
        <p>
          Supported formatting: <strong>bold</strong>, <em>italic</em>,{" "}
          <u>underline</u>, <s>strikethrough</s>, headings, lists, links,
          tables, and more.
        </p>
        <p>
          <strong>Table support:</strong> Tables from Google Docs and other
          sources will be converted to Markdown tables. You can also manually
          create tables using this syntax:
        </p>
        <pre>
          {`| Header 1 | Header 2 | Header 3 |
| :------- | :------: | -------: |
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |`}
        </pre>
        <p>
          <em>
            Note: Use colons in the separator row to control column alignment
            (left, center, right).
          </em>
        </p>
      </div>
      <div className="raw-html-container">
        <h2>Raw HTML</h2>
        <pre className="raw-html-display">{rawHtml}</pre>
      </div>

      <div className="readme-container">
        <h2>Project Documentation</h2>
        <div className="readme-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {readmeContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default App;
