# 🧬 Human Story Atlas (v1.0.0)

An interactive scientific exploration of narrative connections across human experience. Human Story Atlas is a powerful tool for discovering hidden narrative arcs and forgotten stories through a chat-driven interface.

## About the Project

Human Story Atlas is built on the Universal Narrative Genome - a structured scientific decoding of story patterns across time, culture, and genre. It allows users to explore vast collections of stories and uncover hidden connections using natural language queries.

## 🧠 What Is the Human Story Atlas?

The Human Story Atlas is a narrative discovery engine built on top of digitized news archives. It does not return articles. It surfaces **story potential** — arcs, themes, conflicts, and forgotten threads buried in historical data.

### Key Features

- Conversational interface (Jordi) that responds like a narrative researcher
- Real-time story clustering powered by the Universal Narrative Genome
- Thematic story labeling (e.g. "Cold War thriller", "forgotten HBO pilot")
- Emerging arc detection and synthesis from OCR-processed historical sources

This tool helps researchers, filmmakers, journalists, and creatives discover **compelling stories that history almost forgot**.

## 👤 Jordi – Your Narrative Research Assistant

Jordi is your guide through the archive — a conversational AI trained on thousands of articles, arcs, and hidden gems. She's not a search engine; she's a story whisperer who can:

* Find lost stories with dramatic potential
* Write documentary treatments and series concepts
* Uncover patterns and connections across decades
* Link people, places, and power structures into coherent narratives

Try prompts like:

* "Give me 5 stories that could become a true crime series."
* "Who appears in political scandals in Texas in the early 80s?"
* "Write a one-paragraph Netflix pitch for a story about a whistleblower."
* "Find a forgotten sports scandal with dramatic potential."

Every response is powered by the Universal Narrative Genome — Jordi just knows how to read it.

## Key Features

### 💬 Chat-Driven Interface with Jordi

* Ask natural language questions about stories, arcs, and narrative patterns
* Discover hidden connections and forgotten narratives
* Intelligent query processing that understands narrative context
* Conversational interface with an archivist's narrative voice

### 🔍 Smart Filtering

* Filter by publication source
* Set date ranges for temporal analysis
* Dynamically narrow search scope

### 🧩 Narrative Arc Discovery

* AI-powered story arc detection
* Visualization of related stories across time
* Thematic and structural pattern recognition
* Creative labeling of arc types (e.g., "Local Scandal with National Implications", "Gothic Mystery")

### 📊 Universal Narrative Genome Stats

* Track story nodes indexed
* Monitor narrative arcs detected
* Map entities across the narrative space

## Technology Stack

* **Frontend**: Next.js 14, React, Tailwind CSS
* **Backend**: Next.js API routes with Prisma ORM
* **Database**: PostgreSQL with pgvector for vector storage
* **AI**: OpenAI for natural language understanding and vector embeddings

## Getting Started

### Prerequisites

* Node.js (v18+)
* PostgreSQL with pgvector extension
* OpenAI API key
* Access to StoryDredge processed data (for importing stories)

### Installation

1. Clone the repository:  
git clone https://github.com/your-username/human-story-atlas.git  
cd human-story-atlas
2. Install dependencies:  
npm install
3. Set up environment variables:  
cp .env.example .env.local  
# Add your OpenAI API key and database connection details
4. Set up the database:  
npx prisma generate  
npx prisma migrate dev
5. Start the development server:  
npm run dev
6. Visit <http://localhost:3000> to start exploring the Human Story Atlas.

### Data Import from StoryDredge

The Human Story Atlas relies on processed story data from the StoryDredge project. To import data:

1. Ensure the StoryDredge data is available in the project's `StoryDredge/output/hsa-ready` directory
2. Run the import script: `npm run import:dredge`
3. Verify the import was successful: `npm run verify:dredge`

For detailed information about the data import process, see the [Data Import Documentation](docs/DATA_IMPORT.md).

## Usage

1. **Apply filters** to set your search context (publication, date range)
2. **Ask a question** in the prompt box or select an example prompt
3. **Explore results** showing discovered narrative arcs and key stories
4. **Follow suggested queries** to dive deeper into the narrative space

## Example Prompts

* "Show me 5 stories that could become a true crime series"
* "Find a forgotten sports scandal in 1977"
* "Uncover hidden arcs about women leaders in the 1970s"
* "Bring back political crises from the oil boom"
* "Write a one-paragraph Netflix pitch for a story about whistleblowers in the medical industry"
* "Who appears in both environmental stories and political scandals?"

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Built on decades of narrative theory research
* Special thanks to the pioneers of computational narratology
* Inspired by the work of Joseph Campbell, Vladimir Propp, and other narrative structure theorists 