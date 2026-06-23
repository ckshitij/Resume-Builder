package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/resume-builder/backend/internal/assets"
)

func Templates(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(assets.TemplateMeta)
}

func SectionTypes(w http.ResponseWriter, _ *http.Request) {
	types := []map[string]string{
		{"type": "summary", "label": "Professional Summary", "defaultTitle": "Professional Summary"},
		{"type": "experience", "label": "Work Experience", "defaultTitle": "Work Experience"},
		{"type": "education", "label": "Education", "defaultTitle": "Education"},
		{"type": "skills", "label": "Skills", "defaultTitle": "Skills"},
		{"type": "projects", "label": "Projects", "defaultTitle": "Projects"},
		{"type": "certifications", "label": "Certifications", "defaultTitle": "Certifications"},
		{"type": "languages", "label": "Languages", "defaultTitle": "Languages"},
		{"type": "custom", "label": "Custom Section", "defaultTitle": "Additional Information"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(types)
}
