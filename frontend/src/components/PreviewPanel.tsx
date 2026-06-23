import { useState } from 'react';
import { ResumePreview } from './ResumePreview';
import type { ResumeData } from '../types/resume';
import { IconEye } from './Icons';

interface Props {
  data: ResumeData;
}

const ZOOM_LEVELS = [0.65, 0.8, 1, 1.15];

export function PreviewPanel({ data }: Props) {
  const [zoomIdx, setZoomIdx] = useState(2);
  const zoom = ZOOM_LEVELS[zoomIdx];

  return (
    <aside className="preview-pane">
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <IconEye />
          <span>Live Preview</span>
        </div>
        <div className="preview-toolbar-right">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            disabled={zoomIdx === 0}
            title="Zoom out"
          >
            −
          </button>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
            disabled={zoomIdx === ZOOM_LEVELS.length - 1}
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>
      <div className="preview-scroll">
        <div className="preview-canvas" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <ResumePreview data={data} />
        </div>
      </div>
    </aside>
  );
}
