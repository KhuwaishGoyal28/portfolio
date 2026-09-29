# Khuwaish Goyal — Portfolio

> My personal portfolio: an interactive, 3D-styled site showcasing my projects, internships, skills and GitHub work.

[![Live Site](https://img.shields.io/badge/Live%20Site-Open-2ea44f?style=for-the-badge&logo=vercel)](https://khuwaish-portfolio.vercel.app)

**Live site:** https://khuwaish-portfolio.vercel.app

## Highlights
- **Virtual 3D showroom** – one room per project (`showroom.js`)
- **Project theatre pages** – detailed per-project view (`project.html`)
- **3D skill globe** (`globe.js`) and skill cards (`skills.js`)
- Chapters for early builds, competitions, internships, projects, toolbox and GitHub
- Scroll-driven animations
- **Playable web ports** of my Android apps under `apps/` (NayiPehal, FitForce, Gyaankosh, IntelliHire)

## Tech Stack
HTML5, CSS3, vanilla JavaScript, [Three.js](https://threejs.org/), [GSAP](https://gsap.com/) + ScrollTrigger

## Project Structure
```
index.html      # main page
project.html    # project detail page
main.js         # page logic
data.js         # project and profile data
showroom.js     # 3D showroom
globe.js        # 3D skill globe
skills.js       # skill cards
style.css
assets/         # images
apps/           # web ports of Android apps
```

## Run Locally
```bash
npx serve .
```
Then open http://localhost:3000.

## Contact
- LinkedIn: https://www.linkedin.com/in/khuwaishgoyal
- GitHub: https://github.com/KhuwaishGoyal28
