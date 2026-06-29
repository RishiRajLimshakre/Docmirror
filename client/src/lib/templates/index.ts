import type { TemplateDefinition } from '@/types/document';
import { DEFAULT_PAGE_SETTINGS } from '@/types/document';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with an empty page',
    category: 'General',
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    },
  },
  {
    id: 'report',
    name: 'Report',
    description: 'Structured report with title, sections, and conclusion',
    category: 'Academic',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'Report Title' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: 'Author Name' },
          ],
        },
        { type: 'horizontalRule' },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Introduction' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Provide background and context for your report here.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Main Content' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Describe your findings, analysis, or discussion in this section.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Conclusion' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Summarize key points and recommendations.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'References' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Reference 1' }],
                },
              ],
            },
          ],
        },
      ],
    },
    pageSettings: { ...DEFAULT_PAGE_SETTINGS, lineSpacing: 1.5 },
  },
  {
    id: 'assignment',
    name: 'Assignment',
    description: 'Course assignment with cover info and sections',
    category: 'Academic',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'Assignment Title' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Course: ' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Student: ' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Date: ' }],
        },
        { type: 'pageBreak' },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Question 1' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Your answer here...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Question 2' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Your answer here...' }],
        },
      ],
    },
  },
  {
    id: 'internship-report',
    name: 'Internship / Project Report',
    description: 'Formal internship or project documentation template',
    category: 'Professional',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'Internship Project Report' }],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Organization Name' }],
        },
        { type: 'pageBreak' },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Abstract' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Brief summary of the project, objectives, and outcomes.',
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Introduction' }],
        },
        { type: 'paragraph', content: [] },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Project Overview' }],
        },
        { type: 'paragraph', content: [] },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Work Done' }],
        },
        { type: 'paragraph', content: [] },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Learnings & Conclusion' }],
        },
        { type: 'paragraph', content: [] },
      ],
    },
    pageSettings: {
      ...DEFAULT_PAGE_SETTINGS,
      headerText: 'Internship Report',
      showPageNumbers: true,
    },
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
