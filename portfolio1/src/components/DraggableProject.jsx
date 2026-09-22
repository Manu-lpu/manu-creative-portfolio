import React from "https://esm.sh/react@18";

export default function DraggableProject({
  project,
  onMove,
  bringToFront,
}) {
  const ref = React.useRef(null);

  const position = React.useRef({
    x: project.x || 0,
    y: project.y || 0,
  });

  const dragging = React.useRef(false);
  const dragOffset = React.useRef({
    x: 0,
    y: 0,
  });

  // Keep internal position synchronized with React state
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

      dragging.current = true;

      bringToFront();

      const rect = element.getBoundingClientRect();

      // Remember exactly where inside the image
      // the user grabbed it.
      dragOffset.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      element.setPointerCapture?.(event.pointerId);

      element.style.cursor = "grabbing";
    };

    const handlePointerMove = (event) => {
      if (!dragging.current) return;

      const canvas = element.parentElement;

      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();

      const x =
        event.clientX -
        canvasRect.left -
        dragOffset.current.x;

      const y =
        event.clientY -
        canvasRect.top -
        dragOffset.current.y;

      position.current = {
        x,
        y,
      };

      element.style.transform =
        `translate3d(${x}px, ${y}px, 0)`;
    };

    const handlePointerUp = (event) => {
      if (!dragging.current) return;

      dragging.current = false;

      element.releasePointerCapture?.(
        event.pointerId
      );

      element.style.cursor = "grab";

      onMove(
        position.current.x,
        position.current.y
      );
    };

    element.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    element.addEventListener(
      "pointermove",
      handlePointerMove
    );

    element.addEventListener(
      "pointerup",
      handlePointerUp
    );

    element.addEventListener(
      "pointercancel",
      handlePointerUp
    );

    return () => {
      element.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      element.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      element.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      element.removeEventListener(
        "pointercancel",
        handlePointerUp
      );
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

      transform:
        `translate3d(${project.x || 0}px, ${project.y || 0}px, 0)`,

      zIndex: project.z || 1,
    },
  });
}