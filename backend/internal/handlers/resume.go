package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/resume-builder/backend/internal/export"
	"github.com/resume-builder/backend/internal/models"
	"github.com/resume-builder/backend/internal/repository"
)

type ResumeHandler struct {
	repo *repository.ResumeRepository
}

func NewResumeHandler(repo *repository.ResumeRepository) *ResumeHandler {
	return &ResumeHandler{repo: repo}
}

func (h *ResumeHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
	r.Get("/{id}/export/pdf", h.ExportPDF)
	r.Get("/{id}/export/docx", h.ExportDOCX)
	r.Post("/export/pdf", h.ExportPDFFromData)
	r.Post("/export/docx", h.ExportDOCXFromData)
	return r
}

func (h *ResumeHandler) List(w http.ResponseWriter, r *http.Request) {
	resumes, err := h.repo.List(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if resumes == nil {
		resumes = []models.Resume{}
	}
	writeJSON(w, http.StatusOK, resumes)
}

func (h *ResumeHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid resume id")
		return
	}
	resume, err := h.repo.Get(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "resume not found")
		return
	}
	writeJSON(w, http.StatusOK, resume)
}

func (h *ResumeHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateResumeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	resume, err := h.repo.Create(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, resume)
}

func (h *ResumeHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid resume id")
		return
	}
	var req models.UpdateResumeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	resume, err := h.repo.Update(r.Context(), id, req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "resume not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resume)
}

func (h *ResumeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid resume id")
		return
	}
	if err := h.repo.Delete(r.Context(), id); err != nil {
		if strings.Contains(err.Error(), "not found") {
			writeError(w, http.StatusNotFound, "resume not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ResumeHandler) ExportPDF(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid resume id")
		return
	}
	resume, err := h.repo.Get(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "resume not found")
		return
	}
	h.servePDF(w, resume.Data, resume.Title)
}

func (h *ResumeHandler) ExportDOCX(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid resume id")
		return
	}
	resume, err := h.repo.Get(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "resume not found")
		return
	}
	h.serveDOCX(w, resume.Data, resume.Title)
}

func (h *ResumeHandler) ExportPDFFromData(w http.ResponseWriter, r *http.Request) {
	var data models.ResumeData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	h.servePDF(w, data, data.PersonalInfo.FullName)
}

func (h *ResumeHandler) ExportDOCXFromData(w http.ResponseWriter, r *http.Request) {
	var data models.ResumeData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	h.serveDOCX(w, data, data.PersonalInfo.FullName)
}

func (h *ResumeHandler) servePDF(w http.ResponseWriter, data models.ResumeData, filename string) {
	pdfBytes, err := export.GeneratePDF(data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate PDF")
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+sanitizeFilename(filename)+".pdf\"")
	w.Write(pdfBytes)
}

func (h *ResumeHandler) serveDOCX(w http.ResponseWriter, data models.ResumeData, filename string) {
	docxBytes, err := export.GenerateDOCX(data)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate DOCX")
		return
	}
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+sanitizeFilename(filename)+".docx\"")
	w.Write(docxBytes)
}

func parseID(r *http.Request) (uuid.UUID, error) {
	return uuid.Parse(chi.URLParam(r, "id"))
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func sanitizeFilename(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "resume"
	}
	replacer := strings.NewReplacer("/", "-", "\\", "-", "\"", "", ":", "-")
	return replacer.Replace(name)
}
