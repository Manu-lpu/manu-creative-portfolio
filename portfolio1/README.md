Minimal interactive portfolio canvas

Overview

- One fullscreen background image + draggable project images on top.

How to use

- Put your background image at `/background/background.png`.
- Put project images in `/projects/` (e.g. `/projects/project-1.png`).
- Edit `src/projects.js` to change starting positions, sizes, and image paths.

Run

- Open `index.html` in a browser or serve the folder with a static server:

```sh
python -m http.server 8000
# then open http://localhost:8000
```

Notes

- Drag with mouse, trackpad, or touch. Positions persist in `localStorage`.
- Very minimal by design — no UI chrome.
