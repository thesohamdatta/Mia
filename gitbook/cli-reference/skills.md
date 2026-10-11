# Skills

MIA implements focused engineering workflows as CLI skills. The executable map in `core/skills/index.ts` is authoritative if docs and runtime differ.

Skills declare metadata such as required capabilities, side effects, verification expectations, and workflow phase. Capability admission checks whether the current execution context grants the capabilities a skill requires.

MIA provides a workflow and state layer around an agent host; it does not own the host's model loop or underlying tool runtime.

The current registered skills are `grill`, `plan`, `spec`, `setup`, `ship`, `health`, `learn`, `retro`, `memory`, `checkpoint`, `review`, and `vc`.