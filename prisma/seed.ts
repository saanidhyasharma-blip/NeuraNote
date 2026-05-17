import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing database entries
  await prisma.aIUsageLog.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Dr. Evelyn Carter',
      email: 'demo@neuranote.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created demo user: ${user.email} (Password: password123)`);

  // 3. Create Categories
  const catResearch = await prisma.category.create({
    data: { name: 'Research', userId: user.id },
  });
  const catDev = await prisma.category.create({
    data: { name: 'Development', userId: user.id },
  });
  const catStrategy = await prisma.category.create({
    data: { name: 'Strategy', userId: user.id },
  });
  const catDesign = await prisma.category.create({
    data: { name: 'Design Systems', userId: user.id },
  });
  console.log('📂 Categories created successfully.');

  // 4. Create Tags
  const tagAI = await prisma.tag.create({
    data: { name: 'ai', userId: user.id },
  });
  const tagNextJS = await prisma.tag.create({
    data: { name: 'nextjs', userId: user.id },
  });
  const tagProduct = await prisma.tag.create({
    data: { name: 'product', userId: user.id },
  });
  const tagArchitecture = await prisma.tag.create({
    data: { name: 'architecture', userId: user.id },
  });
  const tagUX = await prisma.tag.create({
    data: { name: 'ux', userId: user.id },
  });
  console.log('🏷️ Tags created successfully.');

  // 5. Create Notes
  
  // Note 1: Pinned, Favorited note about AI Agents
  const note1 = await prisma.note.create({
    data: {
      title: 'Next-Gen Multi-Agent Orchestration',
      content: `# Multi-Agent AI Systems

Multi-agent systems represent a paradigm shift in software engineering. By orchestrating specialized autonomous agents instead of querying a single monolithic LLM, we can solve far more complex workflows.

## Core Architectural Pillars
- **Agentic Delegation:** Handing off sub-tasks dynamically to domain-specific agents (e.g., researcher, developer, auditor).
- **Consensus Voting:** Multiple validator agents reaching a majority vote before submitting outputs.
- **Short-Term Context Memory:** Maintaining stateful threads within execution scopes.

> Multi-agent models exhibit emergent collaborative intelligence, completing workflows with 34% higher accuracy compared to traditional chain-of-thought prompt templates.

- [x] Build multi-agent proof of concept in Next.js
- [ ] Evaluate task routing reliability using LLM evaluation benchmarks
- [ ] Deploy containerized execution sandboxes for agents`,
      summary: 'This note outlines multi-agent AI systems, emphasizing agentic delegation, consensus voting, and short-term memory as core pillars to boost accuracy in complex workflows.',
      actionItems: [
        'Build multi-agent proof of concept in Next.js',
        'Evaluate task routing reliability using LLM evaluation benchmarks',
        'Deploy containerized execution sandboxes for agents'
      ],
      isPinned: true,
      isFavorite: true,
      isPublic: true,
      shareId: 'agentic-orchestration-preview-demo',
      userId: user.id,
      categoryId: catResearch.id,
      tags: {
        connect: [{ id: tagAI.id }, { id: tagArchitecture.id }],
      },
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Note 2: Dev note about Next.js 15
  const note2 = await prisma.note.create({
    data: {
      title: 'Next.js 15 App Router & React 19 Strategy',
      content: `# Next.js 15 & React 19 Blueprint

This blueprint covers migrating our core dashboard views to utilize Next.js 15, React 19, and TailwindCSS v4.

## Key Changes
- **Asynchronous Route Parameters:** Params must now be treated as Promises.
- **Server Components & Server Actions:** Simplifying data mutation models and reducing API route boilerplate.
- **Tailwind CSS v4:** Direct v4 imports withinglobals.css with inline @theme custom configs.

### Migration Todo List:
- [x] Upgrade dependencies inside package.json to v15
- [x] Configure prisma schema variables
- [ ] Implement middleware auth redirects
- [ ] Verify hydration warning workarounds in ThemeProvider`,
      summary: 'Blueprint detailing migration plans to Next.js 15 and React 19. Highlights include treating route parameters as promises, using server actions, and adopting Tailwind CSS v4 styling rules.',
      actionItems: [
        'Upgrade dependencies inside package.json to v15',
        'Configure prisma schema variables',
        'Implement middleware auth redirects',
        'Verify hydration warning workarounds in ThemeProvider'
      ],
      isPinned: false,
      isFavorite: false,
      isPublic: false,
      userId: user.id,
      categoryId: catDev.id,
      tags: {
        connect: [{ id: tagNextJS.id }, { id: tagArchitecture.id }],
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Note 3: Product note about glassmorphism UX
  const note3 = await prisma.note.create({
    data: {
      title: 'Modern UI/UX Glassmorphism Guidelines',
      content: `# Glassmorphism & Micro-animations

Design principles for high-end start-up portfolios. NeuraNote uses these visual tokens to stand out as a premium tier SaaS console.

## Visual Tokens
- **Backdrop Blur:** Webkit-backdrop-filter set to 12px or higher.
- **Harmonious border lines:** Semi-transparent borders (border: 1px solid rgba(255,255,255,0.05)).
- **Depth separation:** Rich dark/light values with floating element hover states.

> Always utilize HSL tailored colors instead of flat defaults (red, blue) to align with enterprise design standards.`,
      summary: 'Document describing glassmorphism and micro-animation guidelines. Recommends using backdrop blur, semi-transparent borders, and HSL tailored colors for visual excellence.',
      actionItems: [
        'Apply back-drop blurs to sidebar panels',
        'Integrate subtle fade transitions to navigation clicks'
      ],
      isPinned: false,
      isFavorite: true,
      isPublic: true,
      shareId: 'glassmorphic-design-specs',
      userId: user.id,
      categoryId: catDesign.id,
      tags: {
        connect: [{ id: tagUX.id }, { id: tagProduct.id }],
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // Note 4: Strategy Note about product launches
  await prisma.note.create({
    data: {
      title: 'Q3 Product Growth Launch Roadmap',
      content: `# Q3 Strategic Launch Plan

Our core goals for Q3 focus on introducing real-time multi-user note-sharing rooms, scaling vector database search support, and rolling out custom generative AI prompts.

## Release Schedule
1. **Phase 1 (July):** Collaborative Webhooks & Prisma indexing.
2. **Phase 2 (August):** Semantic Vector Search with pgvector.
3. **Phase 3 (September):** User analytics console release.`,
      userId: user.id,
      categoryId: catStrategy.id,
      tags: {
        connect: [{ id: tagProduct.id }],
      },
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('📝 Seeding notes completed.');

  // 6. Create AI logs to populate analytics graphs beautifully
  const actions = ['SUMMARY', 'ACTION_ITEMS', 'TITLE', 'IMPROVE'];
  const notesCreated = [note1.id, note2.id, note3.id];
  
  for (let i = 0; i < 28; i++) {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomNote = notesCreated[Math.floor(Math.random() * notesCreated.length)];
    const randomDaysAgo = Math.floor(Math.random() * 7); // Spread over past week
    
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - randomDaysAgo);

    await prisma.aIUsageLog.create({
      data: {
        userId: user.id,
        noteId: randomNote,
        actionType: randomAction,
        createdAt: logDate,
      },
    });
  }
  console.log('📈 AI Activity Logs seeded successfully.');
  
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
