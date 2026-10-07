# Sarthak Chhabra: facts for the Ask chat

<!--
How this file works
- The Ask chat's search tool reads ONLY this file. Every "## " section becomes one searchable piece.
- Each section must stand on its own: name Sarthak and the company or product, and include the dates and numbers.
  The search returns sections one by one, so "he did this there" without saying who or where is lost.
- Keep a section to one topic and a few sentences. Split a long topic into several sections.
- Sections about a technology or practice never name a company; name the project instead. Company names belong in the role sections.
- Past jobs are written in the past tense.
- Optional: a line starting with "> " right under a heading lists other ways people ask for it (comma-separated).
  Search matches on them too; the chat never sees or quotes them.
- Live numbers use {{...}} (see assets/data/live-stats.json); they are filled in when the chat reads them.
- After editing: node scripts/build-answer-index.mjs
- docs/answer-bank.csv is now only the fallback for browsers that can't run the AI.

Content decisions: docs/assistant-review.md (reviewed with Sarthak, Oct 2026).
-->

## Who Sarthak is
> about him, introduction, tell me about yourself, summary, years of experience, one-line pitch, what does he do
Sarthak Chhabra spends his days teaching AI agents to behave in production, with 7+ years of backend scars to show for it. He is based in Gurgaon, India, and is a backend and platform engineer who builds the platforms that put AI agents into production: LLM routing engines, RAG pipelines, agent platforms and no-code tooling that turns weeks of engineering into minutes of configuration. In one line: he removes the engineering bottleneck between an idea and a running system.

## Location and time zone
> where is he based, where does he live, which city, which country, time zone
Sarthak is based in Gurgaon, India, in IST (UTC+5:30).

## Languages spoken
Sarthak speaks English, Hindi and Punjabi.

## Outside work
Outside work, Sarthak likes getting out for a drive, eating out, and swimming.

## Career timeline
> work history, where has he worked, list of companies, employment history, how long at each company, tenure, dates of each job
Sarthak's roles, most recent first: Technical Lead at Stashfin, Feb 2026 – Jul 2026 (5 months). Technical Lead, Gen AI at Zupee (Cashgrail Pvt Ltd), Jul 2025 – Feb 2026 (7 months). Senior Software Engineer at Dresma AI, Apr 2022 – Apr 2025 (3 years). Full Stack Developer at Gigforce, May 2021 – Apr 2022 (11 months). Software Developer at Signcatch, Oct 2020 – May 2021 (7 months). Associate Software Engineer at Bosch, Aug 2019 – Oct 2020 (1 year 2 months), after a Project Trainee internship at Bosch from Jan 2019 to Jul 2019. Education: B.E. Computer Science, Lovely Professional University, 2015 – 2019.

## Education
> where did he study, university, college, degree
Sarthak has a B.E. in Computer Science from Lovely Professional University (LPU), 2015 – 2019, graduating with an 8.7 CGPA.

## Career story
> why AI, why did he move to AI, what did he learn at each job, lessons from each company, career journey
Sarthak's own summary of his career: Bosch taught him discipline and engineering rigour, the startups (Signcatch, Gigforce) taught him speed, and Dresma AI taught him to build things that don't fall over. In the AI era he found the work he loves most: platforms that let people deploy production-grade AI agents. He moved toward AI because it is the first time the gap between an idea and a working system dropped so sharply.

## His work in numbers
> impact, achievements, biggest results, metrics
Sarthak's work in production numbers: 44M tokens a day through an agent platform he architected at Stashfin, 300K+ LLM requests a day at 15 to 20ms through a routing engine he built at Zupee, and 46% D15 retention on an AI companion at Zupee. He leads small teams and stays close to the code.

## Stashfin: role summary (Feb 2026 – Jul 2026)
> what did he do at Stashfin, what did he build at Stashfin, Stashfin dates
Sarthak was Technical Lead at Stashfin from Feb 2026 to Jul 2026, working in Node.js, TypeScript, AWS, PostgreSQL, Docker and microservices. He architected and led a no-code platform for building and deploying production AI agents, which cut agent delivery from days to minutes. When he left, its customer support agent was handling around 30,000 messages and 44M tokens a day for 6,000+ daily users.

## Stashfin: no-code agent platform
> how many agents run on his platform, agents live, agent builder
At Stashfin, Sarthak architected a self-serve platform where an agent's prompt, tools, model and channels are configured from a UI and shipped in minutes. One configuration deploys the same agent across Slack, Telegram and other channels, with per-channel auth abstracted away. About 15 agents are live on it; 10 to 12 were built by people outside engineering, and Sarthak's team built the first few as templates.

## Stashfin: dynamic tool framework
At Stashfin, Sarthak designed a tool framework that turns any REST API into an agent-callable tool through configuration instead of hand-written integrations. The user configures the request, the platform fires a live test call to capture the real response shape, and annotated response keys map into the LLM's tool schema. People outside engineering can wire up new tools themselves.

## Stashfin: cross-channel memory
At Stashfin, Sarthak built a contact system that merges a user's email, phone and Slack identities into one record with persistent memory, so an agent keeps context when the user switches channels instead of starting cold.

## Stashfin: RAG ingestion pipeline
At Stashfin, Sarthak developed the RAG ingestion pipeline (upload, chunking, embedding, vector storage) that lets people outside engineering give agents their own knowledge bases without engineering help.

## Stashfin: team
At Stashfin, Sarthak worked closely with one other engineer on the agent platform, and separately led a QA team of six on Playwright test automation across products.

## Stashfin: why he left
Sarthak left Stashfin in Jul 2026 because the role evolved away from the team-building work he had joined for. He is proud of what the team shipped there.

## Zupee: role summary (Jul 2025 – Feb 2026)
> what did he do at Zupee, what did he build at Zupee, how long at Zupee
Sarthak was Technical Lead, Gen AI at Zupee (Cashgrail Pvt Ltd) from Jul 2025 to Feb 2026, working in Node.js, PostgreSQL, Qdrant, MongoDB, LangGraph and microservices. He built the central LLM routing engine, shipped an AI companion chatbot with 46% D15 retention (46% of users were still using it 15 days later), cut promo production from a week to about 3 hours, built a no-code bot management platform, and led a team of 4 engineers across AI products.

## Zupee: LLM routing engine
> hardest technical problem, proudest project, biggest achievement, most impressive thing he built, LLM gateway, LLM router
At Zupee, Sarthak architected one gateway for every LLM call across the company, with budget tracking, rate limiting, multi-provider fallbacks and circuit breakers. It handled 300,000+ requests a day at 15 to 20ms overhead and 99% uptime, and product teams rode out provider outages without noticing. It stayed fast because the routing layer was kept off the hot path, adding only low milliseconds. Sarthak calls it the hardest technical problem he has solved and the project he is proudest of.

## Zupee: AI companion chatbot
> how did the companion reach its retention, AI companion, chatbot retention
At Zupee, Sarthak developed an AI companion chatbot that reached 46% D15 retention: 46% of users were still using it 15 days later. It used LangGraph multi-agent planning for response planning and conflict resolution, RAG-based long-term memory on Qdrant so it carried context across conversations, and reply timing tuned to feel like a human conversation instead of instant answers.

## Zupee: promo generation system
At Zupee, Sarthak built an automated promo generation system that processed 50 to 100 microseries or content variations in parallel for ad creative, cutting production time from a week to about 3 hours. Product managers controlled models and behaviour from a no-code console in a couple of clicks.

## Zupee: no-code bot management platform
At Zupee, Sarthak created a no-code bot management platform so product managers could change AI behaviour, swap models and manage image catalogues themselves, in a couple of clicks. He also owned in-house embeddings for operational control.

## Zupee: why he left
Sarthak's role at Zupee ended in Feb 2026 because India's 2025 law banning online real-money gaming shut down the company's core product, the business he was building AI for.

## Dresma AI: role (Apr 2022 – Apr 2025)
Sarthak was Senior Software Engineer at Dresma AI from Apr 2022 to Apr 2025, working in Node.js, TypeScript, AWS, MongoDB, Kafka and microservices. He owned backend architecture for heavy-computation processing pipelines on Node.js, Kafka and AWS, cutting processing time about 30% and improving stability about 50%, and cut API response times about 40% through profiling and optimisation. He built fault-tolerant services with queue-backed retries on Kafka and SQS, graceful degradation and monitoring, which reduced incidents and recovery time.

## Dresma AI: mentoring
At Dresma AI, Sarthak trained and mentored junior engineers on backend, frontend and AWS infrastructure, which brought about +20% delivery efficiency and −30% error rates.

## Dresma AI: why he left
Sarthak left Dresma AI in Apr 2025 after building deep backend and infrastructure experience there, to move closer to AI and LLM systems, where he saw the work going.

## Gigforce: role (May 2021 – Apr 2022)
Sarthak was Full Stack Developer at Gigforce from May 2021 to Apr 2022, on Node.js, AWS SQS, MongoDB and Vue.js. He led new backend modules end to end, improved stability and query performance with better indexing and service tuning, and built queue-based services on AWS SQS to absorb peak load: about −40% peak-load latency, −30% query response time and +25% stability.

## Signcatch: role (Oct 2020 – May 2021)
> what did he do at Signcatch, Signcatch dates
Sarthak was a Software Engineer at Signcatch from Oct 2020 to May 2021, on React, Angular, PHP and SQL. He developed and maintained new and legacy modules from requirements through to production releases, with about −20% time-to-market, −15% churn and +25% positive user feedback.

## Bosch: role (Aug 2019 – Oct 2020)
> first job, how long at Bosch, what did he do at Bosch
Sarthak started his career at Bosch, first as a Project Trainee intern (Jan 2019 – Jul 2019), then as Associate Software Engineer (Aug 2019 – Oct 2020), on Angular, C# and SQL. He built cross-platform application features working closely with product owners, cutting rework about 20% and ticket resolution time about 25%, and triaged user-reported issues.

## Bosch: why he left
Sarthak left Bosch for the speed and ownership of a startup. Bosch taught him discipline and engineering rigour, and he wanted to apply it somewhere he could move faster and own more.

## Since Stashfin
> what is he doing now, current status, gap after Stashfin
Since leaving Stashfin in Jul 2026, Sarthak has been building and running his own products, AskMyAstro, FileDownloader and Claude Code Switchboard.

## Leadership style
> team size, how many people has he managed, people management, team lead experience
Sarthak's leadership style is hands-on and small-team. He sets the architecture, takes the hardest piece himself, and gives each person a system they fully own. He runs two-way monthly one-on-ones so feedback flows both ways. He has led teams of up to 4 engineers (Zupee) and a QA team of six (Stashfin).

## Mentoring
Sarthak mentors by giving people a system they fully own and making his reasoning explicit: the why behind a decision, not just the what. A junior engineer once told him he gave the what but not the why; he changed how he hands off work, and the team began catching edge cases and pushing back on their own.

## Hiring
Sarthak has hired engineers at junior and senior levels and run the loop end to end: writing the job description, screening, running technical and system design rounds, and making the hire decision. Juniors are judged on fundamentals, learning speed and ownership; seniors on system design judgment, trade-offs and how they raise the team.

## Working with people outside engineering
> non-technical stakeholders, product managers, business teams, working with non-engineers
Sarthak builds tools so people outside engineering don't need engineers for routine changes, like the no-code agent platform and the two-click product console. When they do need him, he frames trade-offs as cost, time and risk rather than implementation detail.

## Prioritising
Sarthak ranks urgent work by blast radius: what breaks the most, or affects the most users, if it isn't done. Work others are blocked on comes first, and he says plainly what waits.

## Handling ambiguity
Sarthak shapes ambiguity before building: he finds the underlying why, turns a vague ask into a concrete first version, and puts it in front of people early so the direction is corrected fast.

## Tech stack and technical skills
> skills, technical skills, tech stack, technologies, tools, programming languages, what does he code in, frameworks, what does he know
Sarthak's current stack: Node.js, TypeScript, JavaScript, SQL, PostgreSQL, MongoDB, Kafka, AWS (SQS and core services), Docker and microservices. On the AI side: LangChain, LangGraph, CrewAI, multi-agent architecture, agent orchestration, RAG pipelines, Qdrant, embeddings, LLM routing and fallbacks, and LLM observability with Langfuse, LangSmith and OpenTelemetry.

## Frontend or backend
Sarthak works mostly on backend and systems today. He has shipped frontend in React, Angular and Vue.js along the way. He prefers TypeScript by default for anything that lives past a week.

## Python
Sarthak's production work is in Node.js and TypeScript. He can pick up Python quickly when a project needs it.

## Kubernetes
Sarthak understands how Kubernetes works and has shipped services that run on it, on Docker and AWS. Standing up and operating clusters is not where his hands-on depth is.

## AWS
Sarthak has used AWS core compute and storage plus SQS for queue-based async processing, which he used to absorb peak load and for queue-backed retries.

## Databases
Sarthak uses both SQL and NoSQL in production: PostgreSQL and MongoDB, plus SQL going back to his first jobs. He picks based on access patterns, not preference.

## Kafka
Sarthak uses Kafka to decouple services with a durable event stream, so a slow or failing consumer doesn't block producers and work can be replayed. He used it for Kafka-driven microservices in heavy-computation processing pipelines.

## Monolith or microservices
Sarthak has no dogma about monoliths versus microservices; he lets the system's shape and scale decide.

## System design
System design is most of what Sarthak does: routing engines with circuit breakers, Kafka-driven microservices, fault-tolerant processing pipelines, and scaling work that brought −40% peak-load latency.

## LLM providers
Sarthak has worked with OpenAI (GPT), Anthropic (Claude) and Google (Gemini), plus open-weight models, both self-hosted and through model routers. His routing work switches between providers without the product noticing. He also runs open-weight models locally to test fit before committing to a hosted provider.

## ML engineering and fine-tuning
Sarthak is not an ML engineer: he is a backend and platform engineer who builds the systems that put LLMs into production, such as gateways, RAG pipelines and agent runtimes. He has not fine-tuned models; retrieval, better prompts and better tool design closed the gaps faster.

## RAG experience
> has he built RAG, retrieval augmented generation, vector search, knowledge bases, chunking
Sarthak has built RAG more than once: an end-to-end ingestion pipeline (upload, chunk, embed, store) for the agent platform, which people outside engineering use for their own knowledge bases, and RAG-based long-term memory on Qdrant for the AI companion. He chunks by semantic units rather than fixed sizes, with overlap so context isn't lost at boundaries. He chose Qdrant as a fast, open-source vector store that is easy to run and scales well.

## LangGraph and multi-agent design
Sarthak used LangGraph on the AI companion to model an agent's flow as an explicit graph, with planning, branching and conflict resolution as defined steps instead of tangled prompt logic. He splits work across multiple agents only for isolated context, distinct tools and permissions, different models per step, or parallelism; otherwise a single agent is simpler and more reliable, and that is his default.

## Evaluating LLM outputs
Sarthak evaluates LLM output with a framework that scores every response against criteria defined up front for good, mediocre and poor answers, so quality is measured consistently across agents instead of by spot-checking.

## Reducing hallucinations
Sarthak reduces hallucinations mainly by grounding: answers are anchored in retrieved context, and the evaluation framework flags weak or off outputs.

## Prompt injection
Sarthak handles prompt injection with defense in depth: prompt-level hardening, a real-time layer that screens each message for override or injection attempts and refuses to act on them, and a separate detection model as a backstop. No single layer is trusted on its own.

## LLM costs
Sarthak controls LLM costs at the gateway: every call runs through one routing layer with per-team and per-product budget tracking and rate limits, so spend is visible in one place.

## LLM latency
Sarthak handles LLM latency with streaming, by keeping routing overhead off the request path, and by choosing the smallest model that meets the quality bar for each step.

## Monitoring agents in production
Sarthak monitors AI agents on request volume and latency, cost and token usage per agent, error and fallback rates, and escalation rates as a sign of where agents fail users. Spend and reliability are tracked centrally at the gateway.

## Prompt versioning
Sarthak keeps prompts and agent behaviour as versioned configuration, not hard-coded strings, so changes can be reviewed and rolled back.

## Human handoff
In Sarthak's agent designs, the agent has a tool to escalate a conversation to a live human. It unlocks only after a few messages, so the agent tries to resolve things itself first.

## PII in fintech
On a fintech agent platform, Sarthak kept raw sensitive data away from the model: PII is masked to placeholders before anything reaches the LLM, and real values are restored only in the final response to the customer.

## MCP servers
Sarthak has built several MCP (Model Context Protocol) servers to connect agents and internal tools.

## AI coding tools
Sarthak uses AI coding tools every day. He runs several Claude Code sessions in parallel, which is why he built Switchboard to keep track of them.

## Testing
Sarthak writes tests alongside code once behaviour is settled and leans on end-to-end coverage for the paths that matter most. He led Playwright automation across several products: flow-based test design, page objects, parallel runs, and coverage dashboards for leadership.

## Code reviews and tech debt
In code reviews Sarthak looks for correctness and edge cases first, then readability and maintainability, and explains the why so reviews teach. He treats tech debt as a running cost: small paydowns go into feature work, and larger refactors are argued in terms of the speed or reliability they buy back.

## His own products
> side projects, what has he built himself, personal projects
Sarthak builds and runs five products of his own: AskMyAstro (an AI astrologer), FileDownloader (a bulk file-download tool), Claude Code Switchboard (an open-source dashboard for Claude Code sessions), Castbar (a Chromecast remote in the Mac menu bar) and DiscreteDocs (PDF tools that run inside the browser). He grows them by building in public: writing about what he makes and sharing it where the right people already are.

## AskMyAstro
AskMyAstro (askmyastro.in) is an AI astrologer Sarthak built and runs solo. It reads a person's birth chart and answers real questions over chat. He built the LLM prompt pipeline, the chart computation and the product around it. It has {{askmyastro.users}} users so far. He built it because other AI astrology apps were built to squeeze money out of people and weren't honest with them; he wanted one that is truthful and helpful first.

## AskMyAstro pricing
AskMyAstro gives free credits on sign-up, enough for a good first experience, and more can be bought any time. People can also bring their own AI API key and are never charged by AskMyAstro, paying only their own key's usage.

## FileDownloader
FileDownloader (filedownloader.in) is a bulk file-download tool Sarthak built and runs solo: paste links, download every file at once as one ZIP. It has served {{filedownloader.downloads}} downloads for {{filedownloader.users}} users.

## Switchboard
> open source, does he contribute to open source, GitHub projects, Claude Code dashboard
Claude Code Switchboard is an open-source (MIT) dashboard Sarthak built for every Claude Code session running on a Mac: what each session is working on, live token burn, how much of the plan is left, and messages between sessions. It has {{switchboard.clones}} installs and {{switchboard.stars}} GitHub stars. He built it after running 12 Claude Code sessions in parallel and losing track of which were waiting on him.

## Switchboard install and privacy
To install Switchboard, in Claude Code run `/plugin marketplace add itssarthak/claudecode-switchboard`, then `/plugin install switchboard`, then `/switchboard`. It runs locally, needs no account and makes no API calls of its own; it reads what Claude Code already writes to disk.

## Castbar
> castbar, chromecast remote, mac menu bar app, google home, nest speakers
Castbar is Sarthak's Chromecast remote for the Mac menu bar. It controls every Chromecast, Google Home and Nest speaker or TV on the Wi-Fi: see what's playing with artwork, pause, skip, seek, and set each device's volume, without picking up a phone. Clicking the title jumps to the Chrome tab that's casting. It's open source on GitHub (github.com/itssarthak/castbar), installs with Homebrew (brew tap itssarthak/castbar, then brew install castbar), needs an Apple Silicon Mac on macOS 11 or later, and launched on Product Hunt on 27 September 2026.

## DiscreteDocs
> discretedocs, pdf tools, merge pdf, compress pdf, convert pdf, private pdf editor
DiscreteDocs (discretedocs.com) is a free set of PDF tools by Sarthak that works inside the visitor's own browser, so files never leave their device. Most PDF websites upload your file to their servers to work on it; DiscreteDocs does the work locally instead. It can merge, split, extract and rotate pages; compress, repair and OCR; convert Word, Excel, PowerPoint, HTML and images to PDF and PDF back to those formats or Markdown; add text, watermarks and page numbers; and sign, protect, unlock, redact and compare PDFs.

## Live numbers on this site
The product numbers on Sarthak's site are pulled daily from Google Analytics and GitHub and are not edited.

## Contact
> email address, how to reach him, contact details, LinkedIn, GitHub, résumé
To contact Sarthak: email hello@sarthakchhabra.com, LinkedIn linkedin.com/in/sarthak-chhabra, or the contact form on this site. He'll get back to you soon. His GitHub is github.com/itssarthak, and his résumé is at resume.html with a PDF download.

## This website
> hidden features, easter eggs, time slider, version history, terminal, how was this site built, is this site open source
Sarthak's site is versioned like software: scrolling through the version history rolls it back, and the projects, stack and look change with each version (v1 student to v6 tech lead). Pressing ~ opens a terminal. The Ask chat runs entirely in the visitor's browser and answers only from Sarthak's own profile, web searches and live stats.

## Work, availability and opportunities
> is he open to work, is he available, is he looking for a job, hiring him, can we hire him, what role does he want, kind of work he wants, companies he wants to work at, salary, remote, relocation, visa, contract, freelance, notice period, when can he start, references, on-call, IC or manager, future plans, five-year goal
For anything about Sarthak's availability, the kind of work or roles he's interested in, salary, location or references, he'd prefer you reach out to him directly at hello@sarthakchhabra.com, so he can give you a proper answer himself.
