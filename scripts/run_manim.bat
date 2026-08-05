@echo off
echo Rendering MIA Manim ASCII Animation Video (#B61C1C)...
python -m manim -pqh scripts/render_mia_manim.py MIAAsciiScene
echo Render complete! Check media/videos/render_mia_manim/1080p60/MIAAsciiScene.mp4
