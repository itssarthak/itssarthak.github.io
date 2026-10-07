# Ask chat review: decisions (Sarthak, 2026-10-05)

Going through everything the assistant is fed, one part at a time. Nothing gets built until all parts are reviewed.

## Part 1: instructions
- Info about the assistant itself: a tool it calls when asked (all of it in one call, no vector search), not a note in every prompt.
- Track how often it can't verify something (count it in the PostHog logs).
- Voice: its own voice (an assistant talking about Sarthak).
- Tone: friendly.
- Purpose: help people get to know Sarthak. Don't push hiring, contacting him, or any goal; many different people reach out to him.
- Chat memory: option A. Fit as many recent messages as the model's input limit allows (newest first), shortening long replies, instead of a fixed 8.
  - When older messages drop out: tell the model they're gone, so it asks the visitor to remind it instead of guessing.
  - Always keep the visitor's first message.
  - Log every time messages are dropped.
  - Cut very long pasted messages, and tell the visitor only the beginning was read.

## Part 2: tool descriptions
- go_to: add "only when the visitor asks to see or go somewhere".
- web_search: stays open to any topic.
- Spelling: "Signcatch" (small c) everywhere in the assistant's data (the résumé page itself says "SignCatch"; not touched).
- New tool about_assistant(): "Everything about you, the assistant: what you are, which model you run, what you can do, and how chats are logged. Use it whenever the visitor asks about you." (accepted as proposed)

## Part 3: what it knows about itself (the about_assistant tool's text)
- Keep the current content (model, built by Sarthak around the model, tools, message form rules, knows nothing about the visitor, anonymous logging).
- Add how it works: Sarthak wrote a profile of facts; it searches it by meaning with a small search model also running in the browser, decides step by step which tool to use, and only states what it found.
- Add its limits: a small model that can get things wrong; answers only from the profile, web search and live stats, not general knowledge.
- Add its purpose: here to help people get to know Sarthak.

## Part 4: fixed texts
- Footer: "from the sources above" only when the reply cites sources; otherwise "Written by an AI in your browser · it can still be wrong".
- After sending a message: "Sent. He'll get back to you soon."
- Phone fallback (no AI): remove "Or email …" after unmatched questions; keep email only when nothing loads at all.
- New long-message text (accepted): "I only read the beginning of that, it was long. Ask me about any part of it."
- Everything else in Part 4 stays as is.

## Part 5: the fact file (docs/knowledge.md)
### Group 1: about him
- Career story: "non-engineers" → "people".
- Who Sarthak is: opening line → "Sarthak Chhabra spends his days teaching AI agents to behave in production, with 7+ years of backend scars to show for it." (no job title); keep Gurgaon and what he builds in the following sentences.
- "Why hire Sarthak" → renamed "His work in numbers", no hiring wording, same facts.
- Signcatch title: "Software Developer" (timeline + role section). NOTE: résumé page still says "Software Engineer"; raise at the end.
### Group 2: Stashfin
- "non-technical teams" / "Non-engineers" → "people" (3 places).
- Role summary: "handles around 30,000 messages…" → "was handling … when he left".
- Why he left: drop "He wants to build and lead a platform team on a long-term roadmap."; end at "…proud of what the team shipped there."
- Remove the "disagreement with his manager" section.
### Group 3: Zupee
- Remove "including an astrology chatbot" (no astrology mention at Zupee).
- "46% D15 retention" gets a plain version: "46% of users were still using it 15 days later" (taken as accepted: no objection).
- Whole file: past jobs in the past tense (taken as accepted: no objection).
### Group 4: earlier roles
- Dresma AI role: add "+50% stability".
- Since Stashfin: drop "while he looks for his next role".
- Remove the "Why his recent roles were short" section.
### Group 5: work preferences and availability
- Remove the whole group: Open to work, Roles he is looking for, Companies he wants to work at, Remote/relocation/visa, Working hours, Contract/freelance, Salary, On-call, References.
- Replace with ONE section that catches all such questions (availability, open to work, roles, kind of work, companies, salary, remote/relocation, contract, notice period, references…):
  the assistant says Sarthak would prefer you reach out to him directly at hello@sarthakchhabra.com.
  Not phrased as "I don't know"; phrased as "he'd prefer you reach out to him directly".
### Group 6: how he works and leads
- Remove: IC or manager, Five-year goal (career preferences → the "reach out directly" section).
- Remove: Biggest weakness, Underperforming engineers (interview-prep feel).
- Keep Hiring as is.
- "Working with non-technical stakeholders" → "Working with people outside engineering" (and "non-technical teams" → "people" in its text).
### Group 7: tech skills
- No changes (Python, Kubernetes, Monolith-or-microservices all stay as is).
### Group 8: AI engineering practices
- Remove "Algorithm interviews".
- RAG experience: "non-technical teams" → "people".
- RULE (applies to Groups 7 and 8): technology/practice sections never name an organisation; name the project instead where useful
  (e.g. "the LLM routing engine", "the AI companion", "the agent platform"). Affects: AWS, Databases, Kafka, RAG experience,
  LangGraph and multi-agent design, PII in fintech, Testing. Company names stay only in the role sections.
### Group 9: products, contact, this site
- Contact: "He usually replies within a day" → "He'll get back to you soon."
- New section "Work, availability and opportunities" with the proposed wording (accepted).
- This website: "answers only from this file" → "answers only from Sarthak's own profile, web searches and live stats".
- Switchboard: remove the "Next on its roadmap" sentence.

## Still open (raise after building)
- Résumé page says "Software Engineer" for Signcatch; the assistant now says "Software Developer".
- The phone fallback (docs/answer-bank.csv) still has hiring/availability answers ("Why should we hire you?", "Are you open to work?", salary…), which the review removed from the assistant.

## Suggestions (chips under the Ask box)
- Removed 8 hiring/availability chips and "hardest problem" (duplicate of "proudest project").
- "non-tech teams" → "people outside engineering".
- Added: outside work, languages, where he is based. 34 chips now.
