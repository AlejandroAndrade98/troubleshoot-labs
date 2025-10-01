import { useEffect, useRef, useState } from "react";

/**
 * Ventana arrastrable y responsive dentro del contenedor (desktop).
 * - initial: {x,y} o "center" para centrar al montar
 * - width: ancho deseado en px (se limita por maxWidthPct del contenedor)
 * - maxWidthPct: porcentaje máximo del contenedor (0-1)
 */
export default function DraggableWindow({
  containerRef,
  frameTitle,
  onClose,
  initial = "center",     // 👈 por defecto centrado
  width = 880,
  maxWidthPct = 0.9,
  children,
}) {
  const winRef = useRef(null);
  const dragRef = useRef({ active: false, offsetX: 0, offsetY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [winWidth, setWinWidth] = useState(width);

  // Calcula ancho efectivo y centra si corresponde
  const computeLayout = (centerIfNeeded = false) => {
    const container = containerRef?.current;
    const win = winRef.current;
    if (!container || !win) return;

    const c = container.getBoundingClientRect();
    const effectiveWidth = Math.min(width, c.width * maxWidthPct);
    setWinWidth(effectiveWidth);

    // Tamaño de la ventana (estimado a partir del ancho; alto lo controla el contenido + max-h)
    const w = effectiveWidth;
    const h = Math.min(520, c.height * 0.8); // solo para centrar/aproximar

    if (initial === "center" && centerIfNeeded) {
      const cx = Math.max((c.width - w) / 2, 0);
      const cy = Math.max((c.height - h) / 2, 0);
      setPos({ x: cx, y: cy });
    } else {
      // Re-clamp si el contenedor cambió de tamaño
      const maxX = Math.max(c.width - w, 0);
      const maxY = Math.max(c.height - h, 0);
      setPos((p) => ({ x: Math.min(Math.max(p.x, 0), maxX), y: Math.min(Math.max(p.y, 0), maxY) }));
    }
  };

  // Montaje: calcular layout y centrar si initial === "center"
  useEffect(() => {
    // Espera un tick para que el contenedor tenga medidas
    const id = requestAnimationFrame(() => computeLayout(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcular al redimensionar ventana
  useEffect(() => {
    const onResize = () => computeLayout(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHeaderMouseDown = (e) => {
    e.stopPropagation();
    const rect = winRef.current.getBoundingClientRect();
    dragRef.current.active = true;
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const container = containerRef.current.getBoundingClientRect();
    const x = e.clientX - container.left - dragRef.current.offsetX;
    const y = e.clientY - container.top - dragRef.current.offsetY;

    // Clamp con el ancho efectivo actual
    const w = winWidth;
    const h = Math.min(520, container.height * 0.8);
    const maxX = Math.max(container.width - w, 0);
    const maxY = Math.max(container.height - h, 0);

    setPos({
      x: Math.min(Math.max(x, 0), maxX),
      y: Math.min(Math.max(y, 0), maxY),
    });
  };

  const onMouseUp = () => {
    dragRef.current.active = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={winRef}
      className="absolute rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: winWidth, maxWidth: "95%" }}
      role="dialog"
      aria-label={frameTitle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra de título (zona draggable) */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 cursor-move select-none"
        onMouseDown={onHeaderMouseDown}
      >
        <div className="font-medium">{frameTitle}</div>
        <button
          className="rounded-md px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          Cerrar
        </button>
      </div>

      {/* Contenido */}
      <div className="max-h-[60vh] md:max-h-[62vh] overflow-auto">{children}</div>
    </div>
  );
}
