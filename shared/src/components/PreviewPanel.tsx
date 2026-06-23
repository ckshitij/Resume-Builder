import { useEffect, useState } from 'react';
import { ResumePreview } from './ResumePreview';
import type { ResumeData } from '../types/resume';
import { IconChevronLeft, IconChevronRight, IconEye } from './Icons';

interface Props {
  data: ResumeData;
  expanded: boolean;
  onToggleExpand: () => void;
}

const ZOOM_COLLAPSED = 0.38;
const ZOOM_EXPANDED_LEVELS = [0.55, 0.7, 0.85, 1, 1.1];

export function PreviewPanel({ data, expanded, onToggleExpand }: Props) {
  const [zoomIdx, setZoomIdx] = useState(2);
  const [fitWidth, setFitWidth] = useState(true);

  useEffect(() => {
    if (!expanded) setFitWidth(true);
  }, [expanded]);

  const zoom = expanded ? ZOOM_EXPANDED_LEVELS[zoomIdx] : ZOOM_COLLAPSED;

  return (
    <aside className={`preview-pane ${expanded ? 'preview-pane-expanded' : 'preview-pane-collapsed'}`}>
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <IconEye />
          <span>{expanded ? 'Live Preview' : 'Preview'}</span>
          {expanded && <span className="preview-badge">Live</span>}
        </div>
        <div className="preview-toolbar-right">
          {expanded && (
            <>
              <button
                type="button"
                className={`btn-fit ${fitWidth ? 'active' : ''}`}
                onClick={() => setFitWidth((f) => !f)}
                title="Fit to panel width"
              >
                Fit
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
                disabled={zoomIdx === 0 || fitWidth}
                title="Zoom out"
              >
                −
              </button>
              <span className="zoom-label">{fitWidth ? 'Fit' : `${Math.round(zoom * 100)}%`}</span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setZoomIdx((i) => Math.min(ZOOM_EXPANDED_LEVELS.length - 1, i + 1))}
                disabled={zoomIdx === ZOOM_EXPANDED_LEVELS.length - 1 || fitWidth}
                title="Zoom in"
              >
                +
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-expand-preview"
            onClick={onToggleExpand}
            title={expanded ? 'Collapse preview' : 'Expand preview'}
            aria-expanded={expanded}
          >
            {expanded ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>
      </div>
      <div className="preview-scroll">
        <div
          className={`preview-canvas ${fitWidth || !expanded ? 'preview-fit' : ''}`}
          style={fitWidth || !expanded ? undefined : { transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          <ResumePreview data={data} />
        </div>
      </div>
    </aside>
  );
}
