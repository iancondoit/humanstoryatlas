# Human Story Atlas

A modern web application for exploring and analyzing stories through time, discovering patterns and connections in human narratives.

## Features

- **Story Browser**: Browse and search through stories with advanced filtering
- **Arc Visualization**: View and analyze narrative arcs that connect stories
- **Timeline View**: Explore stories and arcs on an interactive timeline
- **Narrative Genes**: Visualize story characteristics through narrative gene expressions
- **Similarity Analysis**: Discover related stories and arcs through vector similarity

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **Data Fetching**: SWR
- **Database**: Prisma/PostgreSQL
- **Visualization**: D3.js, Recharts

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/human-story-atlas.git
   cd human-story-atlas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (routes)/          # Main application routes
│   │   ├── stories/       # Story-related pages
│   │   ├── arcs/          # Arc-related pages
│   │   └── timeline/      # Timeline visualization
│   └── debug/             # Development tools
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── stories/          # Story-related components
│   ├── arcs/             # Arc-related components
│   └── timeline/         # Timeline components
└── lib/                  # Utility functions and configurations
```

## Development

- Run the development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run tests: `npm test`
- Run linter: `npm run lint`
- Run type checker: `npm run typecheck`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 