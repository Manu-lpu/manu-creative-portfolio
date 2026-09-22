import React from "https://esm.sh/react@18";

export default function DraggableProject({ project, onMove, bringToFront }) {
  const ref = React.useRef(null);

  const position = React.useRef({
    x: project.x || 0,
    y: project.y || 0,
  });

  const drag = React.useRef(null);

  React.useEffect(() => {
    position.current = {
      x: project.x || 0,
      y: project.y || 0,
    };
  }, [project.x, project.y]);

  React.useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const handlePointerDown = (event) => {
      event.preventDefault();

      bringToFront();

      const currentX = position.current.x;
      const currentY = position.current.y;

      // compute pointer position relative to the scene container so scrolling doesn't break dragging
      const scene = element.closest(".scene") || document.documentElement;
      const sceneRect = scene.getBoundingClientRect();
      const pointerX = event.pageX - (window.scrollX + sceneRect.left);
      const pointerY = event.pageY - (window.scrollY + sceneRect.top);

      drag.current = {
        pointerX,
        pointerY,
        startX: currentX,
        startY: currentY,
      };

      element.setPointerCapture?.(event.pointerId);

      element.style.cursor = "grabbing";
    };

    const handlePointerMove = (event) => {
      if (!drag.current) return;

      const { pointerX, pointerY, startX, startY } = drag.current;

      const scene = element.closest(".scene") || document.documentElement;
      const sceneRect = scene.getBoundingClientRect();
      const currentPointerX = event.pageX - (window.scrollX + sceneRect.left);
      const currentPointerY = event.pageY - (window.scrollY + sceneRect.top);

      const x = Math.round(startX + (currentPointerX - pointerX));
      const y = Math.round(startY + (currentPointerY - pointerY));

      position.current = { x, y };

      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const handlePointerUp = (event) => {
      if (!drag.current) return;

      drag.current = null;

      element.releasePointerCapture?.(event.pointerId);

      element.style.cursor = "grab";

      onMove(position.current.x, position.current.y);
    };

    element.addEventListener("pointerdown", handlePointerDown);

    element.addEventListener("pointermove", handlePointerMove);

    element.addEventListener("pointerup", handlePointerUp);

    element.addEventListener("pointercancel", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);

      element.removeEventListener("pointermove", handlePointerMove);

      element.removeEventListener("pointerup", handlePointerUp);

      element.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [onMove, bringToFront]);

  return React.createElement("img", {
    ref,

    src: project.image,

    alt: "",

    className: "project",

    draggable: false,

    style: {
      width: `${project.width || 300}px`,
      height: "auto",

      transform: `translate3d(
        ${project.x || 0}px,
        ${project.y || 0}px,
        0
      )`,

      zIndex: project.z || 1,
    },
  });
}
