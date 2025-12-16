import { useState, useRef } from "react";

type ViewBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function useWheelZoom(width: number, height: number) {
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    w: width,
    h: height,
  });
  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;

    setViewBox((vb) => {
      const mx = e.nativeEvent.offsetX / width;
      const my = e.nativeEvent.offsetY / height;

      const newW = vb.w * zoomFactor;
      const newH = vb.h * zoomFactor;

      return {
        x: vb.x + (vb.w - newW) * mx,
        y: vb.y + (vb.h - newH) * my,
        w: newW,
        h: newH,
      };
    });
  }

  const isPanning = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    isPanning.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isPanning.current || !last.current) return;

    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;

    setViewBox((vb) => ({
      ...vb,
      x: vb.x - dx * (vb.w / width),
      y: vb.y - dy * (vb.h / height),
    }));

    last.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    isPanning.current = false;
    last.current = null;
  }

  return {
    viewBox,
    isPanning,
    handleWheel,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
  };
}