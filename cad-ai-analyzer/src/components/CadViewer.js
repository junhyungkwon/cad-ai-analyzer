import { useMemo, useRef, useState } from 'react';
import './CadViewer.css';

const PAD = 80;
const VIEW_W = 760;
const VIEW_H = 480;

function CadViewer({ points, segments, selectedSegmentId, onSelectSegment, cursorCoord, onCursorChange }) {
  const svgRef = useRef(null);
  const [hoverPoint, setHoverPoint] = useState(null);

  const bounds = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      minX: Math.min(...xs) - PAD,
      maxX: Math.max(...xs) + PAD,
      minY: Math.min(...ys) - PAD,
      maxY: Math.max(...ys) + PAD,
    };
  }, [points]);

  const scale = useMemo(() => {
    const sx = VIEW_W / (bounds.maxX - bounds.minX);
    const sy = VIEW_H / (bounds.maxY - bounds.minY);
    return Math.min(sx, sy);
  }, [bounds]);

  const toScreen = (x, y) => ({
    x: (x - bounds.minX) * scale,
    y: VIEW_H - (y - bounds.minY) * scale,
  });

  const pathD = useMemo(() => {
    return points
      .map((p, i) => {
        const s = toScreen(p.x, p.y);
        return `${i === 0 ? 'M' : 'L'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
      })
      .join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, scale, bounds]);

  const handleMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const sy = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    const worldX = bounds.minX + sx / scale;
    const worldY = bounds.minY + (VIEW_H - sy) / scale;
    onCursorChange({ x: Math.round(worldX), y: Math.round(worldY) });
  };

  const handleLeave = () => {
    onCursorChange(null);
    setHoverPoint(null);
  };

  return (
    <div className="cad-viewer">
      <div className="cad-toolbar">
        <div className="cad-toolbar-left">
          <span className="badge">LIVE VIEW</span>
          <span className="toolbar-label">도면 위 클릭·호버로 좌표 확인</span>
        </div>
        <div className="coord-readout" aria-live="polite">
          {cursorCoord ? (
            <>
              <span>X {cursorCoord.x.toLocaleString()}</span>
              <span>Y {cursorCoord.y.toLocaleString()}</span>
            </>
          ) : (
            <span className="coord-empty">좌표 대기</span>
          )}
        </div>
      </div>

      <div className="cad-stage">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="cad-svg"
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          role="img"
          aria-label="CAD 도면 뷰어"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(140,170,190,0.18)" strokeWidth="1" />
            </pattern>
            <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3dd6c6" />
              <stop offset="100%" stopColor="#5aa7ff" />
            </linearGradient>
          </defs>

          <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

          {/* 축 눈금 느낌 */}
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 40 + i * 90;
            return (
              <text key={`gx-${i}`} x={x} y={VIEW_H - 10} className="axis-label">
                {Math.round(bounds.minX + (x / scale))}
              </text>
            );
          })}

          <path d={pathD} className="pipe-shadow" />
          <path d={pathD} className="pipe-line" />

          {segments.map((seg, i) => {
            const a = toScreen(points[i].x, points[i].y);
            const b = toScreen(points[i + 1].x, points[i + 1].y);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const active = selectedSegmentId === seg.id;
            return (
              <g key={seg.id} className={`seg-hit ${active ? 'active' : ''}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="seg-hot"
                  onClick={() => onSelectSegment(seg.id)}
                />
                <g className="seg-label" onClick={() => onSelectSegment(seg.id)}>
                  <rect x={mx - 34} y={my - 12} width="68" height="20" rx="2" />
                  <text x={mx} y={my + 3}>
                    {seg.length.toLocaleString()} mm
                  </text>
                </g>
              </g>
            );
          })}

          {points.map((p) => {
            const s = toScreen(p.x, p.y);
            const hot = hoverPoint === p.id;
            return (
              <g
                key={p.id}
                className={`node ${hot ? 'hot' : ''}`}
                onMouseEnter={() => setHoverPoint(p.id)}
                onMouseLeave={() => setHoverPoint(null)}
                onClick={() => onCursorChange({ x: p.x, y: p.y, snap: p.id })}
              >
                <circle cx={s.x} cy={s.y} r={hot ? 8 : 5.5} />
                <text x={s.x + 10} y={s.y - 10}>
                  {p.id} · {p.label}
                </text>
                <text x={s.x + 10} y={s.y + 6} className="node-coord">
                  ({p.x}, {p.y})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default CadViewer;
