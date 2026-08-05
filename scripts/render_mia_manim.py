"""
MIA ASCII Animation Scene (Manim Community Edition)
Color Theme: #B61C1C (Crimson Red)
"""

from manim import *

class MIAAsciiScene(Scene):
    def construct(self):
        # Set Dark Obsidian Background
        self.camera.background_color = "#0A0A0D"
        
        # Color definitions
        crimson_primary = "#B61C1C"
        crimson_bright = "#FF3E3E"

        # ASCII Lines for MIA
        ascii_lines = [
            "  ███╗   ███╗██╗ █████╗ ",
            "  ████╗ ████║██║██╔══██╗",
            "  ██╔████╔██║██║███████║",
            "  ██║╚██╔╝██║██║██╔══██║",
            "  ██║ ╚═╝ ██║██║██║  ██║",
            "  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝"
        ]

        # 1. Title Intro
        intro_text = Text(
            "// MIA MACHINE INTELLIGENCE ARCHITECTURE", 
            font="Consolas", 
            font_size=20, 
            color=crimson_bright
        ).to_edge(UP)

        self.play(Write(intro_text), run_time=1.2)
        self.wait(0.3)

        # 2. Build ASCII Text VGroup
        ascii_group = VGroup()
        for line in ascii_lines:
            line_text = Text(
                line, 
                font="Consolas", 
                font_size=28, 
                weight=BOLD, 
                color=crimson_primary
            )
            ascii_group.add(line_text)

        ascii_group.arrange(DOWN, aligned_edge=LEFT, buff=0.15)
        ascii_group.move_to(ORIGIN)

        # 3. Animate ASCII Lines Assembly
        self.play(
            LaggedStart(
                *[Create(line) for line in ascii_group],
                lag_ratio=0.25
            ),
            run_time=2.5
        )

        # 4. Color Shimmer Effect (#B61C1C -> #FF3E3E -> #B61C1C)
        self.play(
            ascii_group.animate.set_color(crimson_bright),
            run_time=1.0
        )
        self.play(
            ascii_group.animate.set_color(crimson_primary),
            run_time=1.0
        )

        # 5. Outro Badge
        outro_badge = Text(
            "[ COLOR: #B61C1C // SYSTEM ACTIVE ]",
            font="Consolas",
            font_size=18,
            color=crimson_bright
        ).to_edge(DOWN)

        self.play(FadeIn(outro_badge, shift=UP * 0.3), run_time=0.8)
        self.wait(1.5)

if __name__ == "__main__":
    print("Manim script created for MIA ASCII Animation scene.")
