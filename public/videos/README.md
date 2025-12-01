Place your hero video and optional poster image here.

Files recommended:
- `hero.mp4` — short (3–10s) loopable MP4, H.264 (baseline/level 3.1), web-optimized (faststart), muted.
- `hero.webm` — optional WebM fallback for better compression/quality.
- `hero-poster.jpg` or `hero-poster.webp` — static poster image shown while video loads or for low-data users.

Suggested ffmpeg command to create a small loopable MP4 (adjust input and trim as needed):

```powershell
ffmpeg -i input.mov -ss 0 -t 6 -vf "scale=1280:-2,format=yuv420p" -c:v libx264 -preset fast -crf 22 -movflags +faststart -pix_fmt yuv420p public/videos/hero.mp4
```

Accessibility & performance notes:
- Keep video short and muted. Provide a good poster image for users with reduced data or when autoplay is blocked.
- Consider creating a lightweight WebM fallback for smaller file sizes.
- Prefer progressive MP4 with `-movflags +faststart` for streaming.
- If you'd like, I can add `prefers-reduced-motion` handling to pause the video and show the poster instead.

Once you add `hero.mp4` and `hero-poster.jpg`, run `npm run dev` and the hero section will use them automatically.
