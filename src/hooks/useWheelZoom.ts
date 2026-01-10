import { useRef } from "react";

export type ViewBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function useWheelZoom(
  setViewBox: React.Dispatch<React.SetStateAction<ViewBox>>,
  width: number,
  height: number,
) {
  const isPanning = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    if (e.cancelable) e.preventDefault();

    const factor = e.deltaY > 0 ? 1.15 : 0.85;

    const cx = e.nativeEvent.offsetX / width;
    const cy = e.nativeEvent.offsetY / height;

    setViewBox((vb) => zoomAt(vb, factor, cx, cy));
  }

  function zoomIn() {
    setViewBox((vb) => zoomAt(vb, 0.85));
  }

  function zoomOut() {
    setViewBox((vb) => zoomAt(vb, 1.15));
  }

  function handleMouseDown(e: React.MouseEvent) {
    isPanning.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isPanning.current || !last.current) {
      return;
    }

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

  function resetViewBox(initial: ViewBox) {
    setViewBox(initial);
  }

  return {
    isPanning,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetViewBox,
  };
}

function zoomAt(vb: ViewBox, factor: number, cx = 0.5, cy = 0.5): ViewBox {
  const newW = vb.w * factor;
  const newH = vb.h * factor;

  return {
    x: vb.x + (vb.w - newW) * cx,
    y: vb.y + (vb.h - newH) * cy,
    w: newW,
    h: newH,
  };
}
