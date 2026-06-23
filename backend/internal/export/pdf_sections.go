package export

import (
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/models"
)

type pdfSectionStyle struct {
	fontSize      float64
	primaryR      int
	primaryG      int
	primaryB      int
	contentX      float64
	align         string
	expMetaSep    string
	eduMetaSep    string
	eduTitleSep   string
	certMetaSep   string
	skipTypes     map[models.SectionType]bool
	drawHeader    func(title string)
	beforeSection func()
}

func renderEnabledSections(pdf *gofpdf.Fpdf, data models.ResumeData, style pdfSectionStyle) {
	pi := data.PersonalInfo
	for _, section := range data.EnabledSections() {
		if style.skipTypes[section.Type] {
			continue
		}
		if style.beforeSection != nil {
			style.beforeSection()
		}
		switch section.Type {
		case models.SectionSummary:
			if pi.Summary == "" {
				continue
			}
			style.drawHeader(section.Title)
			setContentX(pdf, style)
			w := cellWidth(pdf, style)
			pdf.SetFont("Helvetica", "", style.fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.MultiCell(w, 5, pdfSafeText(pi.Summary), "", style.align, false)

		case models.SectionExperience:
			if len(data.Experience) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			for _, exp := range data.Experience {
				setContentX(pdf, style)
				writeExperienceEntry(pdf, exp, style.fontSize, style.primaryR, style.primaryG, style.primaryB, style.expMetaSep, style.contentX, cellWidth(pdf, style))
			}

		case models.SectionEducation:
			if len(data.Education) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			for _, edu := range data.Education {
				setContentX(pdf, style)
				titleSep := style.eduTitleSep
				if titleSep == "" {
					titleSep = " | "
				}
				writeEducationEntry(pdf, edu, style.fontSize, style.eduMetaSep, titleSep, style.align, style.contentX, cellWidth(pdf, style))
			}

		case models.SectionSkills:
			if len(data.Skills) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			setContentX(pdf, style)
			w := cellWidth(pdf, style)
			pdf.SetFont("Helvetica", "", style.fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.MultiCell(w, 5, pdfSafeText(strings.Join(data.Skills, ", ")), "", style.align, false)

		case models.SectionProjects:
			if len(data.Projects) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			for _, proj := range data.Projects {
				setContentX(pdf, style)
				writeProjectEntry(pdf, proj, style.fontSize, style.align, style.contentX, cellWidth(pdf, style))
			}

		case models.SectionCertifications:
			if len(data.Certifications) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			for _, cert := range data.Certifications {
				setContentX(pdf, style)
				writeCertificationEntry(pdf, cert, style.fontSize, style.certMetaSep, style.align, style.contentX, cellWidth(pdf, style))
			}

		case models.SectionLanguages:
			if len(data.Languages) == 0 {
				continue
			}
			style.drawHeader(section.Title)
			setContentX(pdf, style)
			w := cellWidth(pdf, style)
			var parts []string
			for _, lang := range data.Languages {
				parts = append(parts, fmt.Sprintf("%s (%s)", lang.Name, lang.Proficiency))
			}
			pdf.SetFont("Helvetica", "", style.fontSize)
			pdf.SetTextColor(40, 40, 40)
			pdf.MultiCell(w, 5, pdfSafeText(strings.Join(parts, ", ")), "", style.align, false)

		case models.SectionCustom:
			for _, block := range data.CustomSections {
				if block.SectionID != section.ID || block.Content == "" {
					continue
				}
				style.drawHeader(section.Title)
				setContentX(pdf, style)
				w := cellWidth(pdf, style)
				pdf.SetFont("Helvetica", "", style.fontSize)
				pdf.SetTextColor(40, 40, 40)
				pdf.MultiCell(w, 5, pdfSafeText(block.Content), "", style.align, false)
			}
		}
	}
}

func setContentX(pdf *gofpdf.Fpdf, style pdfSectionStyle) {
	if style.contentX > 0 {
		pdf.SetX(style.contentX)
	}
}

func cellWidth(pdf *gofpdf.Fpdf, style pdfSectionStyle) float64 {
	if style.contentX > 0 {
		pageW, _ := pdf.GetPageSize()
		_, _, right, _ := pdf.GetMargins()
		return pageW - style.contentX - right
	}
	return 0
}

func writeEducationEntry(pdf *gofpdf.Fpdf, edu models.Education, fontSize float64, metaSep, titleSep, align string, contentX, width float64) {
	resetX := func() {
		if contentX > 0 {
			pdf.SetX(contentX)
		}
	}
	resetX()
	pdf.SetFont("Helvetica", "B", fontSize)
	pdf.SetTextColor(40, 40, 40)
	title := strings.TrimSpace(strings.Join([]string{
		strings.TrimSpace(edu.Degree + " " + edu.Field),
		edu.Institution,
	}, titleSep))
	pdf.MultiCell(width, 5, pdfSafeText(title), "", align, false)
	meta := joinNonEmpty([]string{formatDateRange(edu.StartDate, edu.EndDate, false), edu.Location, edu.GPA}, metaSep)
	if meta != "" {
		resetX()
		pdf.SetFont("Helvetica", "", 10)
		pdf.SetTextColor(102, 102, 102)
		pdf.MultiCell(width, 4, pdfSafeText(meta), "", align, false)
	}
	pdf.Ln(2)
}

func writeProjectEntry(pdf *gofpdf.Fpdf, proj models.Project, fontSize float64, align string, contentX, width float64) {
	resetX := func() {
		if contentX > 0 {
			pdf.SetX(contentX)
		}
	}
	resetX()
	pdf.SetFont("Helvetica", "B", fontSize)
	pdf.SetTextColor(40, 40, 40)
	title := proj.Name
	if proj.URL != "" {
		title += " | " + proj.URL
	}
	pdf.MultiCell(width, 5, pdfSafeText(title), "", align, false)
	if proj.Technologies != "" {
		resetX()
		pdf.SetFont("Helvetica", "", 10)
		pdf.SetTextColor(102, 102, 102)
		pdf.MultiCell(width, 4, pdfSafeText(proj.Technologies), "", align, false)
	}
	if proj.Description != "" {
		resetX()
		pdf.SetFont("Helvetica", "", fontSize)
		pdf.SetTextColor(40, 40, 40)
		pdf.MultiCell(width, 5, pdfSafeText(proj.Description), "", align, false)
	}
	pdf.Ln(2)
}

func writeCertificationEntry(pdf *gofpdf.Fpdf, cert models.Certification, fontSize float64, metaSep, align string, contentX, width float64) {
	resetX := func() {
		if contentX > 0 {
			pdf.SetX(contentX)
		}
	}
	resetX()
	pdf.SetFont("Helvetica", "B", fontSize)
	pdf.SetTextColor(40, 40, 40)
	title := cert.Name
	if cert.URL != "" {
		title += " | " + cert.URL
	}
	pdf.MultiCell(width, 5, pdfSafeText(title), "", align, false)
	meta := joinNonEmpty([]string{cert.Issuer, cert.Date}, metaSep)
	if meta != "" {
		resetX()
		pdf.SetFont("Helvetica", "", 10)
		pdf.SetTextColor(102, 102, 102)
		pdf.MultiCell(width, 4, pdfSafeText(meta), "", align, false)
	}
	pdf.Ln(2)
}
