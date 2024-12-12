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
    └── 📁(chat)
        └── 📁actions
            └── contentActions.ts
            └── messageActions.ts
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
            └── 📁nextContentChunk
                └── route.ts
            └── 📁suggestions
                └── route.ts
            └── 📁tellMeMore
                └── route.ts
            └── 📁vote
                └── route.ts
        └── 📁chat
            └── 📁[id]
                └── layout.tsx
                └── opengraph-image.png
                └── page.tsx
                └── twitter-image.png
    └── 📁admin
        └── actions.ts
        └── 📁customers
            └── error.tsx
            └── layout.tsx
            └── nav-item.tsx
            └── page.tsx
            └── product.tsx
            └── products-table.tsx
            └── providers.tsx
            └── search.tsx
            └── user.tsx
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
    └── 📁ui
        └── alert-dialog.tsx
        └── badge.tsx
        └── breadcrumb.tsx
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
        └── table.tsx
        └── tabs.tsx
        └── textarea.tsx
        └── tooltip.tsx
└── 📁db
    └── migrate.ts
    └── queries.ts
    └── schema.ts
└── 📁docs
    └── 📁(development_planning)
        └── 12-6-24_Augment_Brainstorm_steps_to_full_MVP.md
        └── Dec 6, 2024 02-45-05 PM MVP Launch Content.md
        └── Dec 9, 2024 04-38-36 PM MVP_Basic_Admin_Dashboard.md
        └── Dec 11, 2024 11-57-28 AM MVP Content Studio.md
    └── directory-structure.md
    └── LICENSE
    └── README.md
└── 📁drizzle
    └── 0000_tearful_serpent_society.sql
    └── drizzle.config.ts
    └── 📁meta
        └── _journal.json
        └── 0000_snapshot.json
└── 📁helpers
    └── 📁ai
        └── custom-middleware.ts
        └── index.ts
        └── models.ts
        └── prompts.ts
└── 📁hooks
    └── use-mobile.tsx
└── 📁lib
    └── 📁content
        └── getInitialContentChunk.ts
        └── getNextContentChunk.ts
        └── handleUserCheckin.ts
    └── auth.ts
└── 📁public
    └── 📁fonts
        └── geist-mono.woff2
        └── geist.woff2
    └── 📁images
        └── demo-thumbnail.png
        └── placeholder-user.jpg
        └── placeholder.svg
└── 📁sandbox
    └── content_interfaces_draft_v0_1.ts
└── 📁types
    └── contentChunk.ts
    └── learningPath.ts
    └── mediaAsset.ts
    └── module.ts
    └── utils.ts
└── functions.tsx
└── middleware.ts
└── next-env.d.ts
└── next.config.ts
└── package.json
└── pnpm-lock.yaml
└── postcss.config.mjs
└── prettier.config.cjs
└── react-renderer.tsx
└── suggestions.tsx
└── tailwind.config.ts
└── tsconfig.json
```

## Overview

This is a modern AI chatbot application built with Next.js, featuring real-time chat capabilities, document handling, and AI-powered interactions. The application implements authentication, file uploads, chat history, and a rich text editor with markdown support. It's structured as a full-stack application with clear separation of concerns between the frontend UI components, backend API routes, and AI integration layers.

## Key Files in Root Directory

- `package.json`: Defines project dependencies and scripts
- `next.config.ts`: Next.js configuration file for routing and build settings
- `tailwind.config.ts`: Tailwind CSS configuration for styling
- `middleware.ts`: Global middleware for handling authentication and routing
- `tsconfig.json`: TypeScript configuration for the project
- `functions.tsx`: Shared utility functions
- `react-renderer.tsx`: React component rendering utilities
- `suggestions.tsx`: Suggestion system implementation

## Key Components and their Functions

### Authentication Components

- `app/(auth)/*`: Handles user authentication flows including login and registration
- `components/custom/auth-form.tsx`: Reusable authentication form component
- `lib/auth.ts`: Core authentication utilities

### Chat Interface

- `app/(chat)/*`: Main chat functionality with real-time messaging and document handling
- `components/custom/chat.tsx`: Core chat interface component
- `components/custom/message.tsx`: Message rendering component
- `components/custom/multimodal-input.tsx`: Handles multiple input types

### Admin Interface

- `app/admin/*`: Administrative dashboard and customer management
- `app/admin/customers/*`: Customer management interface
- `app/admin/actions.ts`: Admin-specific actions

### UI Components

- `components/ui/*`: Reusable UI components (buttons, inputs, dialogs, etc.)
- `components/custom/*`: Application-specific custom components
- `components/custom/app-sidebar.tsx`: Main application navigation
- `components/custom/chat-header.tsx`: Chat interface header

### Content and Data Management

- `lib/content/*`: Content chunk management and user interactions
- `types/*`: TypeScript type definitions
- `db/*`: Database schema and queries
- `drizzle/*`: Database migrations and configuration

### Development and Documentation

- `docs/*`: Project documentation and development planning
- `sandbox/*`: Development and testing interfaces
- `public/*`: Static assets including fonts and images
