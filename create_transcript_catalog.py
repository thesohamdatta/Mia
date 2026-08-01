import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
import re
import os

# Create workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "YouTube Transcripts Catalog"

# Define styles
header_font = Font(bold=True, size=11, color="FFFFFF")
header_fill = PatternFill(start_color="2F5496", end_color="2F5496", fill_type="solid")
category_fill = PatternFill(start_color="D6E4F0", end_color="D6E4F0", fill_type="solid")
thin_border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)
wrap_alignment = Alignment(wrap_text=True, vertical='top')

# Headers
headers = [
    "ID", "YouTube ID", "Title", "Speaker(s)", "Channel", 
    "Views", "Category", "Subcategory", "Key Topics", 
    "Context/Relevance to MIA", "Transcript File", "YouTube URL", "Status"
]

for col, header in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = thin_border

# Set column widths
col_widths = [5, 12, 45, 25, 18, 10, 22, 22, 35, 35, 50, 35, 10]
for i, width in enumerate(col_widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = width

# Data extracted from transcript files
# Format: (id, youtube_id, title, speaker, channel, views, category, subcategory, key_topics, context_relevance, transcript_file, youtube_url, status)
transcripts_data = [
    # ai-engineer-archive/transcripts/
    (1, "-QFHIoCo-Ko", "Full Walkthrough Workflow for AI Coding", "Various", "AI Engineer", "~", "Coding Workflows", "AI Coding", "Grill-to-ship pipeline, AI coding workflow, best practices", "Direct reference for MIA's grill-to-ship workflow design", "01_-QFHIoCo-Ko_Full_Walkthrough_Workflow_for_AI_Coding.md", "https://www.youtube.com/watch?v=-QFHIoCo-Ko", "Archived"),
    (2, "WkBPX-oDMnA", "Understanding is the New Bottleneck", "Various", "AI Engineer", "~", "Context Engineering", "Understanding", "Context as bottleneck, understanding vs generation", "Core principle for MIA's context engineering approach", "02_WkBPX-oDMnA_Understanding_is_the_new_bottleneck.md", "https://www.youtube.com/watch?v=WkBPX-oDMnA", "Archived"),
    (3, "xUnRQ9vLXxo", "Everything We Knew About Software Has Changed", "Various", "AI Engineer", "~", "AI Engineering", "Paradigm Shift", "Software engineering paradigm shift, AI-native development", "Foundational context for MIA's architecture", "03_xUnRQ9vLXxo_Everything_we_knew_about_software_has_changed.md", "https://www.youtube.com/watch?v=xUnRQ9vLXxo", "Archived"),
    (4, "pMggiOb18tc", "The Golden Age of AI Engineering", "Various", "AI Engineer", "~", "AI Engineering", "Industry Trends", "AI engineering maturity, tools, practices", "Industry benchmark for MIA's evolution", "04_pMggiOb18tc_The_Golden_Age_of_AI_Engineering.md", "https://www.youtube.com/watch?v=pMggiOb18tc", "Archived"),
    (5, "OqM67QG_Ikk", "From Fork to Fleet: Designing an Agent Sandbox Cloud", "Various", "AI Engineer", "~", "Agent Infrastructure", "Sandbox/Cloud", "Agent sandboxes, fleet management, cloud infrastructure", "Relevant for MIA's daemon/agent architecture", "05_OqM67QG_Ikk_From_fork_to_Fleet_Designing_an_Agent_Sandbox_Clou.md", "https://www.youtube.com/watch?v=OqM67QG_Ikk", "Archived"),
    (6, "n97BCfyFIvw", "The Engineer of the Future is the Person Who Is Able to...", "Various", "AI Engineer", "~", "AI Engineering", "Future Skills", "Future engineer skills, AI augmentation", "Vision for MIA's target user", "06_n97BCfyFIvw_The_engineer_of_the_future_is_the_person_who_is_ab.md", "https://www.youtube.com/watch?v=n97BCfyFIvw", "Archived"),
    (7, "0vphxNt4wyk", "Don't Ship Skills Without Evals", "Philipp Schmid", "AI Engineer", "51k", "Agent Evaluation", "Skill Evals", "Skill evaluation mandatory, SkillBench, human vs AI skills, eval-driven development", "CRITICAL: MIA's constitution-check and health gates based on this", "07_0vphxNt4wyk_Dont_Ship_Skills_Without_Evals.md", "https://www.youtube.com/watch?v=0vphxNt4wyk", "Archived"),
    (8, "eBUyTS7SzV4", "Every Company Should Have a Brain", "Various", "AI Engineer", "~", "Organizational AI", "Knowledge Management", "Company knowledge brain, organizational memory", "Relevant for MIA's learning layer and memory.md", "08_eBUyTS7SzV4_Every_company_should_have_a_Brain.md", "https://www.youtube.com/watch?v=eBUyTS7SzV4", "Archived"),
    (9, "Ib5GBkD555M", "Harness Engineering is Not Enough: Why Software Factories Fail", "Dex Horthy", "AI Engineer", "41k", "Software Factories", "Harness Limits", "Harness engineering limits, model training issues, lights-off factories fail", "MIA's philosophy: constitutional runtime > harness only", "09_Ib5GBkD555M_Harness_Engineering_is_not_Enough_Why_Software_Fac.md", "https://www.youtube.com/watch?v=Ib5GBkD555M", "Archived"),
    (10, "rmvDxxNubIg", "No Vibes Allowed: Solving Hard Problems in Complex Systems", "Various", "AI Engineer", "~", "Problem Solving", "Complex Systems", "Hard problems, complex systems, no vibes engineering", "MIA's rigorous approach: verification > confidence", "10_rmvDxxNubIg_No_Vibes_Allowed_Solving_Hard_Problems_in_Complex_.md", "https://www.youtube.com/watch?v=rmvDxxNubIg", "Archived"),
    (11, "1lgFGaHoGq8", "AI's Jurassic Park Period", "Various", "AI Engineer", "~", "AI Industry", "Evolution", "AI evolution phases, current period assessment", "Context for MIA's timing in AI evolution", "11_1lgFGaHoGq8_AIs_Jurassic_Park_Period.md", "https://www.youtube.com/watch?v=1lgFGaHoGq8", "Archived"),
    (12, "KB41dTlX1Uc", "State of the Union: Why Local, Why Now", "Various", "AI Engineer", "~", "Local-First AI", "Local Deployment", "Local-first advantages, privacy, control", "MIA's core principle: local-first, compiled binaries", "12_KB41dTlX1Uc_State_of_the_Union_Why_Local_Why_Now.md", "https://www.youtube.com/watch?v=KB41dTlX1Uc", "Archived"),
    (13, "VGN22pPpb-8", "Thinner Agents on a Smarter Substrate: The Ontology", "Various", "AI Engineer", "~", "Agent Architecture", "Substrate", "Thin agents, smart substrate, ontology design", "MIA's daemon = smart substrate, skills = thin agents", "13_VGN22pPpb-8_Thinner_Agents_on_a_Smarter_Substrate_The_Ontology.md", "https://www.youtube.com/watch?v=VGN22pPpb-8", "Archived"),
    (14, "31GUkCBD-Uc", "Building Closed-Loop Evals for a Multimodal Agent", "Various", "AI Engineer", "~", "Agent Evaluation", "Closed-Loop Evals", "Closed-loop evaluation, multimodal agents", "MIA's evaluation framework design", "14_31GUkCBD-Uc_Building_Closed-Loop_Evals_for_a_Multimodal_Agent_.md", "https://www.youtube.com/watch?v=31GUkCBD-Uc", "Archived"),
    (15, "GdvKNwMcfd0", "From Writing Code to Designing Systems: How the Dev Role Changes", "Various", "AI Engineer", "~", "Role Evolution", "Dev Role", "Developer role evolution, system design focus", "MIA enables system design over coding", "15_GdvKNwMcfd0_From_Writing_Code_to_Designing_Systems_How_the_Dev.md", "https://www.youtube.com/watch?v=GdvKNwMcfd0", "Archived"),
    (16, "il1c1a2FufU", "Full Workshop: Setting Yourself Up for Success", "Various", "AI Engineer", "~", "Workshop", "Setup/Success", "AI engineering setup, success patterns", "MIA bootstrap and daily rituals", "16_il1c1a2FufU_Full_Workshop_Setting_Yourself_Up_for_Success.md", "https://www.youtube.com/watch?v=il1c1a2FufU", "Archived"),
    (17, "APqXGyCoGW4", "Forward Deployed Engineering at Cursor", "Various", "AI Engineer", "~", "Engineering Practice", "Forward Deployed", "Forward deployed engineering model", "MIA as personal forward-deployed engineer", "17_APqXGyCoGW4_Forward_Deployed_Engineering_at_Cursor.md", "https://www.youtube.com/watch?v=APqXGyCoGW4", "Archived"),
    (18, "u6jJcIFDLE4", "Why We Killed Our Multi-Agent Pipeline", "Subbiah Sethuraman, Abhilash Asokan", "AI Engineer", "15k", "Multi-Agent", "Pipeline Failure", "Multi-agent pipeline failure, context loss, coherence, single agent consolidation", "MIA's AURA: single agent + dynamic sub-agents, not distributed reasoning", "18_u6jJcIFDLE4_Why_We_Killed_Our_Multi-Agent_Pipeline.md", "https://www.youtube.com/watch?v=u6jJcIFDLE4", "Archived"),
    (19, "VrpEyglYgeU", "In the Land of AI Agents, the Verifiers Are King", "Tariq Shaukat", "AI Engineer", "15k", "Verification", "Zero-Trust Verification", "Zero-trust multi-layered verification, AC/DC loop, verification baked in", "MIA's health gate (≥7), adversarial review, constitution-check", "19_VrpEyglYgeU_In_the_Land_of_AI_Agents_the_Verifiers_Are_King.md", "https://www.youtube.com/watch?v=VrpEyglYgeU", "Archived"),
    (20, "9QebvrrY3KY", "Claude for Long-Horizon Tasks", "Lance Martin", "AI Engineer", "14k", "Long-Horizon", "Managed Agents", "Brain/hands decoupling, session as append-only log, recursive LMs", "MIA's daemon architecture: brain (CLI) + hands (skills)", "20_9QebvrrY3KY_Claude_for_Long-Horizon_Tasks.md", "https://www.youtube.com/watch?v=9QebvrrY3KY", "Archived"),
    (21, "c35YoMdnI78", "The Great Loops Debate", "Dex Horthy, Geoff Huntley et al.", "AI Engineer", "13k", "Loops/Automation", "Loop Discipline", "Loops hype vs reality, discipline over magic, Kubernetes analogy", "MIA's grill-to-ship = disciplined loops, not magic", "21_c35YoMdnI78_The_Great_Loops_Debate.md", "https://www.youtube.com/watch?v=c35YoMdnI78", "Archived"),
    (22, "uU5Gv2h8-9g", "Claude Fable, Claude Tag and Anthropic's Culture", "Various", "AI Engineer", "~", "Anthropic Culture", "Model Culture", "Anthropic's approach, model character, culture", "MIA's constitutional character inspired by Anthropic", "22_uU5Gv2h8-9g_Claude_Fable_Claude_Tag_and_Anthropics_Culture.md", "https://www.youtube.com/watch?v=uU5Gv2h8-9g", "Archived"),

    # AIengg/ subdirectories - key ones
    (23, "8kMaTybvDUw", "12-Factor Agents: Patterns of Reliable LLM Applications", "Various", "AI Engineer", "~", "Agent Patterns", "12-Factor", "12-factor agent patterns, reliability, LLM app design", "MIA's skill/daemon architecture follows 12-factor principles", "AIengg/reliable-agents-and-patterns/8kMaTybvDUw_12-Factor_Agents_Patterns_of_reliable_LLM_applicat.md", "https://www.youtube.com/watch?v=8kMaTybvDUw", "Archived"),
    (24, "am_oeAoUhew", "Building Reliable AI Agents - Patterns and Practices", "Various", "AI Engineer", "~", "Agent Reliability", "Patterns", "Reliable agent patterns, error handling, retries", "MIA's daemon resilience, health checks", "AIengg/reliable-agents-and-patterns/am_oeAoUhew_Building_Reliable_AI_Agents_Patterns_and_Practices.md", "https://www.youtube.com/watch?v=am_oeAoUhew", "Archived"),
    (25, "ow1we5PzK-o", "Agent Evaluation Frameworks", "Various", "AI Engineer", "~", "Agent Evaluation", "Frameworks", "Evaluation frameworks, metrics, benchmarks", "MIA's eval framework design", "AIengg/agent-engineering-and-evals/ow1we5PzK-o_Agent_Evaluation_Frameworks.md", "https://www.youtube.com/watch?v=ow1we5PzK-o", "Archived"),
    (26, "vy7o1g2iHY8", "Building AI Agents That Work", "Various", "AI Engineer", "~", "Agent Engineering", "Practical", "Practical agent building, common pitfalls", "MIA's skill executor implementation", "AIengg/agent-engineering-and-evals/vy7o1g2iHY8_Building_AI_Agents_That_Work.md", "https://www.youtube.com/watch?v=vy7o1g2iHY8", "Archived"),
    (27, "W2HVdB4Jbjs", "Context Engineering for AI Agents", "Various", "AI Engineer", "~", "Context Engineering", "Context", "Context engineering principles, management", "MIA's context layer, learning layer, rituals", "AIengg/context-layer-and-long-horizon/W2HVdB4Jbjs_Context_Engineering_for_AI_Agents.md", "https://www.youtube.com/watch?v=W2HVdB4Jbjs", "Archived"),
    (28, "jVGCulhBRZI", "Agent Memory and Long-Term Learning", "Various", "AI Engineer", "~", "Agent Memory", "Long-Term", "Memory systems, long-term learning, retention", "MIA's learning layer: JSONL, decay, memory.md", "AIengg/context-layer-and-long-horizon/jVGCulhBRZI_Agent_Memory_and_Long_Term_Learning.md", "https://www.youtube.com/watch?v=jVGCulhBRZI", "Archived"),
    (29, "BEKc4P87XKo", "AI Agent Architectures at Scale", "Various", "AI Engineer", "~", "Agent Architecture", "Scale", "Scalable agent architectures, patterns", "MIA's AURA multi-agent design", "AIengg/developer-productivity-and-architecture/BEKc4P87XKo_AI_Agent_Architectures_at_Scale.md", "https://www.youtube.com/watch?v=BEKc4P87XKo", "Archived"),

    # Other categories - key ones
    (30, "D7_ipDqhtwk", "How We Build Effective Agents - Barry Zhang (Anthropic)", "Barry Zhang", "AI Engineer", "~", "Agent Engineering", "Anthropic", "Anthropic's agent building methodology, patterns", "MIA's constitutional principles from Anthropic", "ai-engineer-archive/agent-engineering-and-evals/D7_ipDqhtwk_How_We_Build_Effective_Agents_Barry_Zhang_Anthropi.md", "https://www.youtube.com/watch?v=D7_ipDqhtwk", "Archived"),
    (31, "d5EltXhbcfA", "Building and Evaluating AI Agents - Sayash Kapoor", "Sayash Kapoor", "AI Engineer", "~", "Agent Evaluation", "Academic", "Agent evaluation methodology, benchmarks", "MIA's eval framework", "AIengg/agent-engineering-and-evals/d5EltXhbcfA_Building_and_evaluating_AI_AgentsSayash_Kapoor_AI_.md", "https://www.youtube.com/watch?v=d5EltXhbcfA", "Archived"),
]

# Write data rows
for row_idx, data in enumerate(transcripts_data, 2):
    for col_idx, value in enumerate(data, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=value)
        cell.alignment = wrap_alignment
        cell.border = thin_border
        # Alternate row colors
        if row_idx % 2 == 0:
            cell.fill = PatternFill(start_color="F2F7FC", end_color="F2F7FC", fill_type="solid")

# Freeze panes
ws.freeze_panes = "A2"

# Auto-filter
ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{len(transcripts_data)+1}"

# Save
output_path = r"C:\Users\Soham\Downloads\AI\mia\YOUTUBE_TRANSCRIPTS_CATALOG.xlsx"
wb.save(output_path)
print(f"Saved to {output_path}")
print(f"Total transcripts cataloged: {len(transcripts_data)}")