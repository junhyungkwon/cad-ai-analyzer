import './DataPanel.css';

function DataPanel({
  tab,
  onTabChange,
  points,
  segments,
  totalLen,
  excelRows,
  selectedSegmentId,
  onSelectSegment,
  aiNotes,
  analyzed,
}) {
  return (
    <aside className="data-panel" aria-label="분석 결과">
      <div className="tabs" role="tablist">
        {[
          { id: 'guide', label: '사용법' },
          { id: 'coords', label: '좌표' },
          { id: 'lengths', label: '연장' },
          { id: 'excel', label: '엑셀' },
          { id: 'ai', label: 'AI' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel-body">
        {tab === 'guide' && (
          <div className="guide-panel">
            <p className="guide-lead">
              CAD 도면과 엑셀 BOM을 올리면 좌표·연장 길이를 뽑고 AI로 맞춰 보는 도구입니다.
              지금은 데모 데이터로 화면을 체험할 수 있습니다.
            </p>

            <ol className="guide-steps">
              <li>
                <strong>파일 업로드</strong>
                <span>왼쪽에서 CAD(DXF/DWG/이미지)와 엑셀(XLSX/CSV)을 선택합니다.</span>
              </li>
              <li>
                <strong>AI 분석 실행</strong>
                <span>
                  <em>AI로 좌표·연장 추출</em> 버튼을 누르면 노드·구간·총연장을 계산하고 AI 요약을
                  만듭니다.
                </span>
              </li>
              <li>
                <strong>도면에서 좌표 확인</strong>
                <span>
                  가운데 뷰어에 마우스를 올리면 실시간 X/Y가 표시됩니다. 점(P1…)을 클릭하면 해당
                  노드 좌표로 스냅됩니다.
                </span>
              </li>
              <li>
                <strong>연장(길이) 확인</strong>
                <span>
                  도면의 mm 라벨 또는 <em>연장</em> 탭에서 구간별 길이와 총 연장을 봅니다. 행을
                  클릭하면 해당 구간이 강조됩니다.
                </span>
              </li>
              <li>
                <strong>엑셀·AI 대조</strong>
                <span>
                  <em>엑셀</em> 탭에서 BOM을 확인하고, <em>AI</em> 탭에서 도면 기하와 스펙·수량이
                  맞는지 요약을 확인합니다.
                </span>
              </li>
            </ol>

            <div className="guide-tip">
              <span className="guide-tip-label">TIP</span>
              <p>
                실무에서는 DXF를 권장합니다. DWG는 서버에서 DXF로 변환한 뒤 파싱하는 구성이
                안정적입니다.
              </p>
            </div>
          </div>
        )}

        {tab === 'coords' && (
          <div className="table-wrap">
            <div className="panel-meta">노드 {points.length}개 · 단위 mm</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>명칭</th>
                  <th>X</th>
                  <th>Y</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td>{p.label}</td>
                    <td className="mono num">{p.x.toLocaleString()}</td>
                    <td className="mono num">{p.y.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'lengths' && (
          <div className="table-wrap">
            <div className="length-summary">
              <div>
                <span className="kicker">총 연장</span>
                <strong className="mono">{totalLen.toLocaleString()} mm</strong>
              </div>
              <div>
                <span className="kicker">세그먼트</span>
                <strong className="mono">{segments.length}</strong>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>구간</th>
                  <th>From → To</th>
                  <th>연장</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr
                    key={s.id}
                    className={selectedSegmentId === s.id ? 'selected' : ''}
                    onClick={() => onSelectSegment(s.id)}
                  >
                    <td className="mono">{s.id}</td>
                    <td>
                      {s.fromLabel} → {s.toLabel}
                    </td>
                    <td className="mono num">{s.length.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'excel' && (
          <div className="table-wrap">
            <div className="panel-meta">BOM / 스펙 시트 미리보기</div>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>품명</th>
                  <th>스펙</th>
                  <th>재질</th>
                  <th>수량</th>
                </tr>
              </thead>
              <tbody>
                {excelRows.map((r) => (
                  <tr key={r.no}>
                    <td className="mono">{r.no}</td>
                    <td>{r.name}</td>
                    <td className="mono">{r.spec}</td>
                    <td>{r.material}</td>
                    <td className="mono num">{r.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ai' && (
          <div className="ai-panel">
            {!analyzed ? (
              <p className="ai-empty">
                CAD와 엑셀을 올린 뒤 <strong>AI로 좌표·연장 추출</strong>을 누르면 도면 기하와 BOM을
                맞춰 요약합니다.
              </p>
            ) : (
              <ul className="ai-list">
                {aiNotes.map((note, i) => (
                  <li key={i}>
                    <span className="ai-index">{String(i + 1).padStart(2, '0')}</span>
                    <p>{note}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default DataPanel;
