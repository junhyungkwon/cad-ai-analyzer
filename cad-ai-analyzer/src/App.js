import { useMemo, useState } from 'react';
import UploadPanel from './components/UploadPanel';
import CadViewer from './components/CadViewer';
import DataPanel from './components/DataPanel';
import { analyzeWithAi } from './api/analyze';
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
  const [aiNotes, setAiNotes] = useState([]);
  const [aiError, setAiError] = useState(null);
  const [aiModel, setAiModel] = useState(null);

  const points = DEMO_POLYLINE;
  const segments = useMemo(() => buildSegments(points), [points]);
  const totalLen = useMemo(() => totalLength(segments), [segments]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAiError(null);
    setShowDemo(true);

    try {
      const result = await analyzeWithAi({
        points,
        segments,
        totalLength: totalLen,
        excelRows: DEMO_EXCEL_ROWS,
        selectedSegmentId,
      });

      setAiNotes(result.notes || []);
      setAiModel(result.model || null);
      setAnalyzed(true);
      setTab('ai');
    } catch (err) {
      setAiError(err.message || 'AI 분석에 실패했습니다.');
      setAnalyzed(false);
      setTab('ai');
    } finally {
      setAnalyzing(false);
    }
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
          <span className="pill soft">{aiModel ? aiModel : 'OpenAI'}</span>
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
                <strong>AI</strong> — OpenAI로 기하+BOM 대조 요약.
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
            aiError={aiError}
            analyzed={analyzed}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
