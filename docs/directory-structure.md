# Directory Structure

The following tree shows the complete directory structure of the project:

```text
└── 📁ai
    └── custom-middleware.ts
    └── index.ts
    └── models.ts
    └── prompts.ts
└── 📁app
    └── 📁(auth)
        └── 📁api
            └── 📁auth
                └── 📁[...nextauth]
                    └── route.ts
        └── 📁login
            └── page.tsx
        └── 📁register
            └── page.tsx
        └── actions.ts
        └── auth.config.ts
        └── auth.ts
    └── 📁(chat)
        └── 📁api
            └── 📁chat
                └── route.ts
            └── 📁document
                └── route.ts
            └── 📁files
                └── 📁upload
                    └── route.ts
            └── 📁history
                └── route.ts
            └── 📁suggestions
                └── route.ts
            └── 📁vote
                └── route.ts
        └── 📁chat
            └── 📁[id]
                └── page.tsx
        └── actions.ts
        └── layout.tsx
        └── opengraph-image.png
        └── page.tsx
        └── twitter-image.png
    └── favicon.ico
    └── globals.css
    └── layout.tsx
└── 📁components
    └── 📁custom
        └── app-sidebar.tsx
        └── auth-form.tsx
        └── block-stream-handler.tsx
        └── block.tsx
        └── chat-header.tsx
        └── chat.tsx
        └── diffview.tsx
        └── document-skeleton.tsx
        └── document.tsx
        └── editor.tsx
        └── icons.tsx
        └── markdown.tsx
        └── message-actions.tsx
        └── message.tsx
        └── model-selector.tsx
        └── multimodal-input.tsx
        └── overview.tsx
        └── preview-attachment.tsx
        └── sidebar-history.tsx
        └── sidebar-toggle.tsx
        └── sidebar-user-nav.tsx
        └── sign-out-form.tsx
        └── submit-button.tsx
        └── suggestion.tsx
        └── theme-provider.tsx
        └── toolbar.tsx
        └── use-block-stream.tsx
        └── use-scroll-to-bottom.ts
        └── version-footer.tsx
        └── weather.tsx
    └── 📁ui
        └── alert-dialog.tsx
        └── button.tsx
        └── card.tsx
        └── dropdown-menu.tsx
        └── input.tsx
        └── label.tsx
        └── select.tsx
        └── separator.tsx
        └── sheet.tsx
        └── sidebar.tsx
        └── skeleton.tsx
        └── textarea.tsx
        └── tooltip.tsx
└── 📁db
    └── migrate.ts
    └── queries.ts
    └── schema.ts
└── 📁docs
    └── directory-structure.md
    └── LICENSE
    └── README.md
└── 📁hooks
    └── use-mobile.tsx
└── 📁lib
    └── 📁drizzle
        └── 📁meta
            └── _journal.json
            └── 0000_snapshot.json
            └── 0001_snapshot.json
            └── 0002_snapshot.json
        └── 0000_keen_devos.sql
        └── 0001_sparkling_blue_marvel.sql
        └── 0002_wandering_riptide.sql
    └── 📁editor
        └── config.ts
        └── diff.js
        └── functions.tsx
        └── react-renderer.tsx
        └── suggestions.tsx
    └── utils.ts
└── 📁public
    └── 📁fonts
        └── geist-mono.woff2
        └── geist.woff2
    └── 📁images
        └── demo-thumbnail.png
└── 📁sandbox
    └── content_interfaces_draft_v0_1.ts
└── .env
└── .eslintrc.json
└── .gitignore
└── components.json
└── drizzle.config.ts
└── middleware.ts
└── next-env.d.ts
└── next.config.ts
└── package.json
└── pnpm-lock.yaml
└── postcss.config.mjs
└── prettier.config.cjs
└── tailwind.config.ts
└── tsconfig.json
```

## Overview

This is a modern AI chatbot application built with Next.js 15, featuring real-time chat capabilities, document handling, and AI-powered interactions. The application implements authentication, file uploads, chat history, and a rich text editor with markdown support. It's structured as a full-stack application with clear separation of concerns between the frontend UI components, backend API routes, and AI integration layers.

## Key Files in Root Directory

- `package.json`: Defines project dependencies and scripts, including Next.js, AI SDK, authentication, and UI components
- `next.config.ts`: Next.js configuration file for routing and build settings
- `drizzle.config.ts`: Database configuration using Drizzle ORM
- `middleware.ts`: Global middleware for handling authentication and routing
- `.env`: Environment variables configuration (not tracked in git)
- `tailwind.config.ts`: Tailwind CSS configuration for styling
- `tsconfig.json`: TypeScript configuration for the project

## Key Components and their Functions

### Authentication Components

- `app/(auth)/*`: Handles user authentication flows including login, registration, and session management
- `components/custom/auth-form.tsx`: Reusable authentication form component
- `components/custom/sign-out-form.tsx`: Handles user logout functionality

### Chat Interface

- `app/(chat)/*`: Main chat functionality including real-time messaging and document handling
- `components/custom/chat.tsx`: Core chat interface component
- `components/custom/message.tsx`: Individual message rendering
- `components/custom/multimodal-input.tsx`: Handles various input types including text and file uploads

### Editor and Document Handling

- `components/custom/editor.tsx`: Rich text editor implementation
- `components/custom/document.tsx`: Document viewer and handler
- `components/custom/diffview.tsx`: Shows differences between document versions

### UI Components

- `components/custom/app-sidebar.tsx`: Main application navigation
- `components/custom/chat-header.tsx`: Chat interface header with controls
- `components/custom/markdown.tsx`: Markdown rendering component
- `components/ui/*`: Reusable UI components like buttons, inputs, and dialogs

### AI Integration

- `ai/*`: AI-related functionality including custom middleware and model definitions
- `ai/custom-middleware.ts`: Custom handling for AI interactions
- `ai/models.ts`: AI model configurations and interfaces
