package export

import (
	"archive/zip"
	"bytes"
	"fmt"
	"html"
	"io"
	"strings"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/assets"
	"github.com/resume-builder/backend/internal/models"
)

func GeneratePDF(data models.ResumeData, html string) ([]byte, error) {
	if strings.TrimSpace(html) != "" {
		return GeneratePDFFromHTML(html)
	}
	// Legacy fallback for GET /api/resumes/{id}/export/pdf without HTML.
	switch data.EffectiveTemplate() {
	case models.TemplateModern:
		return generateModernPDF(data)
	case models.TemplateMinimal:
		return generateMinimalPDF(data)
	case models.TemplateATS:
		return generateATSPDF(data)
	default:
		return generateClassicPDF(data)
	}
}

func GenerateDOCX(data models.ResumeData) ([]byte, error) {
	body := buildDOCXBody(data)
	return packDOCX(body)
}

func generateATSPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "Letter", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	pi := data.PersonalInfo
	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(26, 26, 26)
	pdf.CellFormat(0, 8, pdfSafeText(pi.FullName), "", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(40, 40, 40)
	if err := writeContactLine(pdf, pi, 10); err != nil {
		return nil, err
	}
	pdf.Ln(1)

	renderEnabledSections(pdf, data, pdfSectionStyle{
		fontSize:    fontSize,
		align:       "L",
		expMetaSep:  " | ",
		eduMetaSep:  " | ",
		eduTitleSep: " | ",
		certMetaSep: " | ",
		drawHeader: func(title string) {
			drawATSSection(pdf, title)
		},
	})

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawATSSection(pdf *gofpdf.Fpdf, title string) {
	pdf.Ln(3)
	pdf.SetFont("Helvetica", "B", 12)
	pdf.CellFormat(0, 6, pdfSafeText(strings.ToUpper(title)), "", 1, "L", false, 0, "")
	y := pdf.GetY()
	pdf.SetDrawColor(0, 0, 0)
	pdf.Line(15, y, 200, y)
	pdf.Ln(2)
}

func buildDOCXBody(data models.ResumeData) string {
	var b strings.Builder
	writePara := func(text string, bold bool, size int) {
		if text == "" {
			return
		}
		style := ""
		if bold {
			style = `<w:rPr><w:b/><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		} else {
			style = `<w:rPr><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		}
		b.WriteString(`<w:p><w:r>` + style + `<w:t xml:space="preserve">` + xmlEscape(text) + `</w:t></w:r></w:p>`)
	}
	writeItalicPara := func(text string, size int) {
		if text == "" {
			return
		}
		style := `<w:rPr><w:i/><w:sz w:val="` + fmt.Sprint(size*2) + `"/></w:rPr>`
		b.WriteString(`<w:p><w:r>` + style + `<w:t xml:space="preserve">` + xmlEscape(text) + `</w:t></w:r></w:p>`)
	}

	pi := data.PersonalInfo
	writePara(pi.FullName, true, 16)
	writePara(joinNonEmpty([]string{pi.Email, pi.Phone, pi.Location, pi.Website, pi.LinkedIn, pi.GitHub}, " | "), false, 10)

	for _, section := range data.EnabledSections() {
		switch section.Type {
		case models.SectionSummary:
			if pi.Summary == "" {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			writePara(pi.Summary, false, 11)
		case models.SectionExperience:
			if len(data.Experience) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, exp := range data.Experience {
				role := exp.Position
				if exp.Company != "" {
					if role != "" {
						role += " · "
					}
					role += exp.Company
				}
				writePara(role, true, 11)
				meta := joinNonEmpty([]string{formatDateRange(exp.StartDate, exp.EndDate, exp.Current), exp.Location}, " · ")
				writePara(meta, false, 10)
				if strings.TrimSpace(exp.CompanyDescription) != "" {
					writeItalicPara(stripRichMarkup(exp.CompanyDescription), 9)
				}
				for _, line := range strings.Split(exp.Description, "\n") {
					line = strings.TrimSpace(line)
					if line != "" {
						writePara("• "+stripRichMarkup(line), false, 11)
					}
				}
			}
		case models.SectionEducation:
			if len(data.Education) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, edu := range data.Education {
				writePara(fmt.Sprintf("%s %s | %s", edu.Degree, edu.Field, edu.Institution), true, 11)
				writePara(joinNonEmpty([]string{formatDateRange(edu.StartDate, edu.EndDate, false), edu.Location, edu.GPA}, " | "), false, 10)
			}
		case models.SectionSkills:
			if len(data.Skills) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			writePara(strings.Join(data.Skills, ", "), false, 11)
		case models.SectionProjects:
			if len(data.Projects) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, proj := range data.Projects {
				title := proj.Name
				if proj.URL != "" {
					title += " | " + proj.URL
				}
				writePara(title, true, 11)
				writePara(proj.Technologies, false, 10)
				writePara(proj.Description, false, 11)
			}
		case models.SectionCertifications:
			if len(data.Certifications) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			for _, cert := range data.Certifications {
				title := cert.Name
				if cert.URL != "" {
					title += " | " + cert.URL
				}
				writePara(title, true, 11)
				writePara(joinNonEmpty([]string{cert.Issuer, cert.Date}, " · "), false, 10)
			}
		case models.SectionLanguages:
			if len(data.Languages) == 0 {
				continue
			}
			writePara(strings.ToUpper(section.Title), true, 12)
			var parts []string
			for _, lang := range data.Languages {
				parts = append(parts, fmt.Sprintf("%s (%s)", lang.Name, lang.Proficiency))
			}
			writePara(strings.Join(parts, ", "), false, 11)
		case models.SectionCustom:
			for _, block := range data.CustomSections {
				if block.SectionID != section.ID || block.Content == "" {
					continue
				}
				writePara(strings.ToUpper(section.Title), true, 12)
				writePara(block.Content, false, 11)
			}
		}
	}

	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
		`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
		`<w:body>` + b.String() + `<w:sectPr/></w:body></w:document>`
}

func packDOCX(documentXML string) ([]byte, error) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	staticFiles := []string{
		"[Content_Types].xml",
		"_rels/.rels",
		"word/_rels/document.xml.rels",
	}
	for _, name := range staticFiles {
		content, err := assets.DOCXBase.ReadFile("templates/docx/" + name)
		if err != nil {
			return nil, err
		}
		if err := writeZipFile(zw, name, content); err != nil {
			return nil, err
		}
	}
	if err := writeZipFile(zw, "word/document.xml", []byte(documentXML)); err != nil {
		return nil, err
	}
	if err := zw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func writeZipFile(zw *zip.Writer, name string, content []byte) error {
	w, err := zw.Create(name)
	if err != nil {
		return err
	}
	_, err = io.Copy(w, bytes.NewReader(content))
	return err
}

func xmlEscape(s string) string {
	return html.EscapeString(s)
}
