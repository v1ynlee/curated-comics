export interface EditorJsonNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: EditorJsonNode[];
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdownToHtml(value: string) {
  let next = escapeHtml(value);
  next = next.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">');
  next = next.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  next = next.replace(/`([^`]+)`/g, '<code>$1</code>');
  next = next.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  next = next.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return next;
}

export function markdownToEditorHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${paragraph.map(inlineMarkdownToHtml).join('<br>')}</p>`);
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim().startsWith('```')) {
      flushParagraph();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2])}</h${level}>`);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image) {
      flushParagraph();
      html.push(`<img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}">`);
      continue;
    }

    if (/^>\s+/.test(line)) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s+/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s+/, ''));
        index += 1;
      }
      index -= 1;
      html.push(`<blockquote><p>${quoteLines.map(inlineMarkdownToHtml).join('<br>')}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(`<li><p>${inlineMarkdownToHtml(lines[index].replace(/^[-*]\s+/, ''))}</p></li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(`<li><p>${inlineMarkdownToHtml(lines[index].replace(/^\d+\.\s+/, ''))}</p></li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return html.join('') || '<p></p>';
}

function serializeInline(nodes: EditorJsonNode[] = []) {
  return nodes.map((node) => serializeNode(node, true)).join('');
}

function applyMarks(text: string, marks: EditorJsonNode['marks']) {
  if (!marks?.length) return text;

  return marks.reduce((current, mark) => {
    if (mark.type === 'bold') return `**${current}**`;
    if (mark.type === 'italic') return `*${current}*`;
    if (mark.type === 'code') return `\`${current}\``;
    if (mark.type === 'link' && typeof mark.attrs?.href === 'string') return `[${current}](${mark.attrs.href})`;
    return current;
  }, text);
}

function serializeNode(node: EditorJsonNode, inline = false): string {
  if (node.type === 'text') return applyMarks(node.text ?? '', node.marks);
  if (node.type === 'hardBreak') return '\n';
  if (node.type === 'image') {
    const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
    const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
    return src ? `![${alt}](${src})` : '';
  }

  const children = node.content ?? [];

  if (node.type === 'doc') return children.map((child) => serializeNode(child)).filter(Boolean).join('\n\n');
  if (node.type === 'paragraph') return serializeInline(children).trim();
  if (node.type === 'heading') {
    const level = typeof node.attrs?.level === 'number' ? Math.min(Math.max(node.attrs.level, 1), 3) : 2;
    return `${'#'.repeat(level)} ${serializeInline(children).trim()}`.trim();
  }
  if (node.type === 'blockquote') {
    return children
      .map((child) => serializeNode(child))
      .join('\n')
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }
  if (node.type === 'bulletList') {
    return children.map((child) => `- ${serializeNode(child, true).replace(/\n/g, '\n  ')}`).join('\n');
  }
  if (node.type === 'orderedList') {
    return children.map((child, index) => `${index + 1}. ${serializeNode(child, true).replace(/\n/g, '\n   ')}`).join('\n');
  }
  if (node.type === 'listItem') return children.map((child) => serializeNode(child, inline)).filter(Boolean).join('\n');
  if (node.type === 'codeBlock') {
    const code = children.map((child) => child.text ?? '').join('');
    return `\`\`\`\n${code}\n\`\`\``;
  }
  if (node.type === 'horizontalRule') return '---';

  return children.map((child) => serializeNode(child, inline)).filter(Boolean).join(inline ? '' : '\n\n');
}

export function editorJsonToMarkdown(json: EditorJsonNode) {
  return serializeNode(json).replace(/\n{3,}/g, '\n\n').trim();
}

export function countWords(markdown: string) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~\-\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plain ? plain.split(' ').length : 0;
}

export function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[#>*_`~\-\[\]\(\)]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createExcerpt(markdown: string, maxLength = 300) {
  const plain = markdownToPlainText(markdown);
  if (plain.length <= maxLength) return plain;

  const limit = Math.max(0, maxLength - 3);
  const truncated = plain.slice(0, limit + 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 120 ? lastSpace : limit).trim()}...`;
}
