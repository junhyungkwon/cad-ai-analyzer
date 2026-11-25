import { useMemo, useState } from 'react';
import UploadPanel from './components/UploadPanel';
import CadViewer from './components/CadViewer';
import DataPanel from './components/DataPanel';
import {
  DEMO_POLYLINE,
  DEMO_EXCEL_ROWS,
  buildSegments,
  totalLength,
} from './data/mockDrawing';
import './App.css';

function App() {
  const [cadFile, setCadFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [tab, setTab] = useState('guide');
  const [selectedSegmentId, setSelectedSegmentId] = useState('S1');
  const [cursorCoord, setCursorCoord] = useState(null);
  const [showDemo, setShowDemo] = useState(true);

  const points = DEMO_POLYLINE;
  const segments = useMemo(() => buildSegments(points), [points]);
  const totalLen = useMemo(() => totalLength(segments), [segments]);

  const aiNotes = useMemo(
    () => [
      `도면 폴리라인에서 노드 ${points.length}개, 세그먼트 ${segments.length}개를 추출했습니다.`,
      `총 연장 ${totalLen.toLocaleString()} mm — 엑셀 주배관 A(Ø150)와 매칭됩니다.`,
      `엘보 위치 P3·P5가 BOM의 엘보 90° 수량(2)과 일치합니다.`,
      selectedSegmentId
        ? `선택 구간 ${selectedSegmentId}: ${
            segments.find((s) => s.id === selectedSegmentId)?.length.toLocaleString() ?? '-'
          } mm`
        : '구간을 선택하면 상세 연장이 강조됩니다.',
    ],
    [points.length, segments, totalLen, selectedSegmentId]
  );

  const handleAnalyze = () => {
    setAnalyzing(true);
    setShowDemo(true);
    window.setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
      setTab('ai');
      setSelectedSegmentId('S1');
    }, 1100);
  };

  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-wash" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-block">
          <p className="brand">CAD AI Analyzer</p>
          <p className="tagline">도면 좌표 · 연장 길이 · 엑셀 BOM을 한 화면에서</p>
        </div>
        <div className="topbar-meta">
          <span className="pill">{showDemo ? 'DEMO DATA' : 'LIVE'}</span>
          <span className="pill soft">DXF → 좌표 / 연장</span>
        </div>
      </header>

      <main className="workspace">
        <section className="left-rail">
          <UploadPanel
            cadFile={cadFile}
            excelFile={excelFile}
            onCadChange={setCadFile}
            onExcelChange={setExcelFile}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
          />

          <div className="flow-card">
            <h2>권장 파이프라인</h2>
            <ol>
              <li>
                <strong>CAD</strong> — DXF 우선 (브라우저 파싱). DWG는 서버 변환.
              </li>
              <li>
                <strong>기하 추출</strong> — LINE/POLYLINE/ARC → 노드·세그먼트·연장.
              </li>
              <li>
                <strong>엑셀</strong> — 품명·스펙·수량을 BOM 테이블로 정규화.
              </li>
              <li>
                <strong>AI</strong> — 기하+BOM 대조, 누락·불일치·총연장 요약.
              </li>
            </ol>
          </div>
        </section>

        <section className="viewer-pane">
          <CadViewer
            points={points}
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={(id) => {
              setSelectedSegmentId(id);
              setTab('lengths');
            }}
            cursorCoord={cursorCoord}
            onCursorChange={setCursorCoord}
          />
        </section>

        <section className="right-rail">
          <DataPanel
            tab={tab}
            onTabChange={setTab}
            points={points}
            segments={segments}
            totalLen={totalLen}
            excelRows={DEMO_EXCEL_ROWS}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={setSelectedSegmentId}
            aiNotes={aiNotes}
            analyzed={analyzed}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
