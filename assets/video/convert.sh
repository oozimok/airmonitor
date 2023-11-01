#!/usr/bin/env bash

# В colorkey=0x00ff00:0.1:0.1 части разделены :
# Первая часть — ключевой цвет 0x00ff00 зеленый.
# Вторая часть — сходство 0.01 соответствует только точному цвету ключа, а 1.0 соответствует всему.
# Третья часть — процент смеси 0.0 делает пиксели либо полностью прозрачными, либо непрозрачными вообще.
#
# Более высокие значения приводят к полупрозрачным пикселям, чем выше прозрачность, тем больше цвет пикселей похож на ключевой цвет.
#
# --------
#
# brew install ffmpeg
# colorkey=0x00ff00:0.1:0.1
#ffmpeg -ss 00:00:22.10 -to 00:00:23.12 -i videoplayback.mp4 -c copy output.mp4

# ffmpeg -i output.mp4 -vf cropdetect -f null -

#blue
# ffmpeg -i output.mp4 -c:v libvpx-vp9 -vf "colorkey=0x0167ff:0.1:0.1,format=yuva420p,scale=512:512:force_original_aspect_ratio=decrease" -auto-alt-ref 0 output.webm

# green
ffmpeg -i output.mp4 -c:v libvpx-vp9 -vf "colorkey=0x00ff00:0.4:0.0,format=yuva420p,scale=512:512:force_original_aspect_ratio=decrease" -auto-alt-ref 0 output.webm
