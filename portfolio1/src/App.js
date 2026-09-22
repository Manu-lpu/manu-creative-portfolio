import React from "https://esm.sh/react@18";
import DraggableProject from "./components/DraggableProject.js";
import initialProjects, { background } from "./projects.js";

export default function App() {
  const [projects, setProjects] = React.useState(() => {
    try {
      const raw = localStorage.getItem("portfolio.projects.v1");
      if (!raw) return initialProjects;
      const stored = JSON.parse(raw);
      // Merge defaults from initialProjects while preserving stored positions.
      // For visual fields like `width` and `size`, prefer stored when present,
      // otherwise fall back to defaults so new artwork sizing applies.
      return initialProjects.map((def) => {
        const found = stored.find((s) => s.id === def.id) || {};
        return {
          ...def,
          ...found,
          width: found.width ?? def.width,
          size: found.size ?? def.size,
        };
      });
    } catch (e) {
      return initialProjects;
    }
  });
  const [displayProjects, setDisplayProjects] = React.useState([]);
  const [scale, setScale] = React.useState(1);

  const zRef = React.useRef(1000);

  React.useEffect(() => {
    const clamp = () => {
      setProjects((prev) => prev.map((p) => (p.x < 0 ? { ...p, x: 0 } : p)));
    };

    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const img = new Image();
    img.src = background;
    img.onload = () => {
      // If there are no stored positions, clamp display coords and persist natural-space positions
      try {
        const raw = localStorage.getItem("portfolio.projects.v1");
        if (!raw) {
          // compute display mapping now (best-effort) and persist natural coords
          const naturalW = img.naturalWidth || window.innerWidth;
          const naturalH = img.naturalHeight || window.innerHeight;
          const displayW =
            window.innerWidth || document.documentElement.clientWidth;
          const s = displayW / naturalW || 1;
          const displayBgWidth = displayW;
          const displayBgHeight = Math.round(naturalH * s);

          const disp = projects.map((p) => {
            const dispW = Math.round((p.width || 200) * s * 1.5);
            const rawX = Math.round((p.x || 0) * s);
            const clampedX = Math.min(
              Math.max(rawX, 0),
              Math.max(0, displayBgWidth - dispW - 8),
            );
            const rawY = Math.round((p.y || 0) * s);
            const clampedY = Math.min(
              Math.max(0, rawY),
              Math.max(0, displayBgHeight - 16),
            );
            return {
              id: p.id,
              x: Math.round(clampedX / s),
              y: Math.round(clampedY / s),
              width: p.width,
              z: p.z,
            };
          });

          try {
            localStorage.setItem("portfolio.projects.v1", JSON.stringify(disp));
            // update state with natural coords so subsequent renders use them
            setProjects((prev) =>
              prev.map((p) => {
                const found = disp.find((d) => d.id === p.id) || {};
                return { ...p, x: found.x ?? p.x, y: found.y ?? p.y };
              }),
            );
          } catch (e) {}
        }
      } catch (e) {}
      if (!mounted) return;
      const naturalW = img.naturalWidth || window.innerWidth;
      const naturalH = img.naturalHeight || window.innerHeight;
      const displayW =
        window.innerWidth || document.documentElement.clientWidth;
      const s = displayW / naturalW || 1;
      const displayBgWidth = displayW;
      const displayBgHeight = Math.round(naturalH * s);
      setScale(s);
      const disp = projects.map((p) => {
        const dispW = Math.round((p.width || 200) * s * 1.5);
        const rawX = Math.round((p.x || 0) * s);
        const clampedX = Math.min(
          Math.max(rawX, 0),
          Math.max(0, displayBgWidth - dispW - 8),
        );
        const dispY = Math.round((p.y || 0) * s);
        const clampedY = Math.min(
          Math.max(0, dispY),
          Math.max(0, displayBgHeight - 16),
        );
        return {
          ...p,
          x: clampedX,
          y: clampedY,
          width: dispW,
        };
      });
      setDisplayProjects(disp);
    };

    const onResize = () => {
      const naturalW = img.naturalWidth || window.innerWidth;
      const naturalH = img.naturalHeight || window.innerHeight;
      const displayW =
        window.innerWidth || document.documentElement.clientWidth;
      const s = displayW / naturalW || 1;
      const displayBgWidth = displayW;
      const displayBgHeight = Math.round(naturalH * s);
      setScale(s);
      setDisplayProjects(
        projects.map((p) => {
          const dispW = Math.round((p.width || 200) * s * 1.5);
          const rawX = Math.round((p.x || 0) * s);
          const clampedX = Math.min(
            Math.max(rawX, 0),
            Math.max(0, displayBgWidth - dispW - 8),
          );
          const rawY = Math.round((p.y || 0) * s);
          const clampedY = Math.min(
            Math.max(0, rawY),
            Math.max(0, displayBgHeight - 16),
          );
          return {
            ...p,
            x: clampedX,
            y: clampedY,
            width: dispW,
          };
        }),
      );
    };

    window.addEventListener("resize", onResize);
    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
    };
  }, [projects]);

  React.useEffect(() => {
    try {
      localStorage.setItem("portfolio.projects.v1", JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  const updateProject = (id, patch) =>
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  const bringToFront = (id) => {
    zRef.current += 1;
    updateProject(id, { z: zRef.current });
  };

  return React.createElement(
    "div",
    { className: "canvas" },
    React.createElement(
      "div",
      { className: "scene" },

      React.createElement("img", {
        src: background,
        className: "bg-image",
        alt: "background",
      }),
      displayProjects.map((p) =>
        React.createElement(DraggableProject, {
          key: p.id,
          project: p,
          onMove: (x, y) => {
            const s = scale || 1;
            const naturalX = Math.round(x / s);
            const naturalY = Math.round(y / s);
            updateProject(p.id, {
              x: Math.max(0, naturalX),
              y: Math.max(0, naturalY),
            });
          },
          bringToFront: () => bringToFront(p.id),
        }),
      ),
    ),
  );
}
