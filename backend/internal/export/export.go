package export

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/models"
)

func generateClassicPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AddPage()

	r, g, b := hexToRGB(data.Customization.PrimaryColor)
	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFont("Helvetica", "B", 22)
	pdf.SetTextColor(r, g, b)
	pdf.CellFormat(0, 10, pdfSafeText(data.PersonalInfo.FullName), "", 1, "L", false, 0, "")

	pdf.SetFont("Helvetica", "", 10)
	pdf.SetTextColor(80, 80, 80)
	if err := writeContactLine(pdf, data.PersonalInfo, 10); err != nil {
		return nil, err
	}
	pdf.Ln(1)

	renderEnabledSections(pdf, data, pdfSectionStyle{
		fontSize:    fontSize,
		primaryR:    r,
		primaryG:    g,
		primaryB:    b,
		align:       "L",
		expMetaSep:  " | ",
		eduMetaSep:  " | ",
		eduTitleSep: " - ",
		certMetaSep: " | ",
		drawHeader: func(title string) {
			pdf.Ln(3)
			drawSectionHeader(pdf, title, r, g, b)
		},
	})

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func generateModernPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.AddPage()

	r, g, b := hexToRGB(data.Customization.PrimaryColor)
	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFillColor(r, g, b)
	pdf.Rect(0, 0, 70, 297, "F")

	pdf.SetXY(8, 15)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(255, 255, 255)
	lines := pdf.SplitText(pdfSafeText(data.PersonalInfo.FullName), 54)
	for _, line := range lines {
		pdf.CellFormat(54, 7, line, "", 1, "L", false, 0, "")
		pdf.SetX(8)
	}

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(8, pdf.GetY()+8)
	for _, item := range []string{data.PersonalInfo.Email, data.PersonalInfo.Phone, data.PersonalInfo.Location} {
		if item != "" {
			pdf.CellFormat(54, 4, pdfSafeText(item), "", 1, "L", false, 0, "")
			pdf.SetX(8)
		}
	}

	if data.IsSectionEnabled(models.SectionSkills) && len(data.Skills) > 0 {
		pdf.SetXY(8, pdf.GetY()+10)
		pdf.SetFont("Helvetica", "B", 11)
		pdf.SetTextColor(255, 255, 255)
		pdf.CellFormat(54, 6, data.SectionTitle(models.SectionSkills), "", 1, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 9)
		for _, skill := range data.Skills {
			pdf.SetX(8)
			pdf.CellFormat(54, 4, "- "+pdfSafeText(skill), "", 1, "L", false, 0, "")
		}
	}

	pdf.SetXY(78, 15)
	renderEnabledSections(pdf, data, pdfSectionStyle{
		fontSize:    fontSize,
		primaryR:    r,
		primaryG:    g,
		primaryB:    b,
		contentX:    78,
		align:       "L",
		expMetaSep:  " | ",
		eduMetaSep:  " | ",
		eduTitleSep: " - ",
		certMetaSep: " | ",
		skipTypes: map[models.SectionType]bool{
			models.SectionSkills: true,
		},
		drawHeader: func(title string) {
			pdf.SetXY(78, pdf.GetY()+6)
			pdf.SetFont("Helvetica", "B", 12)
			pdf.SetTextColor(r, g, b)
			pdf.CellFormat(0, 7, pdfSafeText(title), "", 1, "L", false, 0, "")
		},
	})

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func generateMinimalPDF(data models.ResumeData) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(25, 25, 25)
	pdf.AddPage()

	fontSize := float64(data.Customization.FontSize)
	if fontSize < 9 {
		fontSize = 11
	}

	pdf.SetFont("Helvetica", "B", 20)
	pdf.SetTextColor(20, 20, 20)
	pdf.CellFormat(0, 10, pdfSafeText(data.PersonalInfo.FullName), "", 1, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(120, 120, 120)
	contact := joinNonEmpty([]string{data.PersonalInfo.Email, data.PersonalInfo.Phone, data.PersonalInfo.Location}, " | ")
	pdf.CellFormat(0, 5, pdfSafeText(contact), "", 1, "C", false, 0, "")
	pdf.Ln(8)

	pdf.SetDrawColor(200, 200, 200)
	pdf.Line(25, pdf.GetY(), 185, pdf.GetY())
	pdf.Ln(6)

	renderEnabledSections(pdf, data, pdfSectionStyle{
		fontSize:    fontSize,
		align:       "C",
		expMetaSep:  " | ",
		eduMetaSep:  " | ",
		eduTitleSep: " - ",
		certMetaSep: " | ",
		drawHeader: func(title string) {
			pdf.Ln(4)
			pdf.SetFont("Helvetica", "B", 8)
			pdf.SetTextColor(150, 150, 150)
			pdf.CellFormat(0, 5, strings.ToUpper(title), "", 1, "C", false, 0, "")
			pdf.Ln(2)
		},
	})

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawSectionHeader(pdf *gofpdf.Fpdf, title string, r, g, b int) {
	pdf.SetFont("Helvetica", "B", 12)
	pdf.SetTextColor(r, g, b)
	pdf.CellFormat(0, 7, pdfSafeText(title), "", 1, "L", false, 0, "")
	y := pdf.GetY()
	pdf.SetDrawColor(r, g, b)
	pdf.Line(20, y, 190, y)
	pdf.Ln(2)
}

func writeExperienceEntry(pdf *gofpdf.Fpdf, exp models.Experience, fontSize float64, r, g, b int, metaSep string, contentX, width float64) {
	if metaSep == "" {
		metaSep = " | "
	}
	if width <= 0 {
		width = contentWidth(pdf)
	}
	resetX := func() {
		if contentX > 0 {
			pdf.SetX(contentX)
		}
	}

	resetX()
	role := strings.TrimSpace(exp.Position)
	if exp.Company != "" {
		if role != "" {
			role += " | "
		}
		role += exp.Company
	}
	if role != "" {
		pdf.SetFont("Helvetica", "B", fontSize)
		pdf.SetTextColor(40, 40, 40)
		pdf.MultiCell(width, 5, pdfSafeText(role), "", "L", false)
	}

	meta := joinNonEmpty([]string{formatDateRange(exp.StartDate, exp.EndDate, exp.Current), exp.Location}, metaSep)
	if meta != "" {
		resetX()
		pdf.SetFont("Helvetica", "", 10)
		pdf.SetTextColor(102, 102, 102)
		pdf.MultiCell(width, 4, pdfSafeText(meta), "", "L", false)
	}
	if strings.TrimSpace(exp.CompanyDescription) != "" {
		resetX()
		pdf.SetFont("Helvetica", "I", 9)
		pdf.SetTextColor(85, 85, 85)
		pdf.MultiCell(width, 4, pdfSafeText(stripRichMarkup(exp.CompanyDescription)), "", "L", false)
	}
	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(60, 60, 60)
	for _, line := range strings.Split(exp.Description, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		resetX()
		pdf.MultiCell(width, 4, pdfSafeText("- "+stripRichMarkup(line)), "", "L", false)
	}
	pdf.Ln(2)
}

func contentWidth(pdf *gofpdf.Fpdf) float64 {
	pageW, _ := pdf.GetPageSize()
	_, _, right, _ := pdf.GetMargins()
	return pageW - pdf.GetX() - right
}

func joinNonEmpty(parts []string, sep string) string {
	var out []string
	for _, p := range parts {
		if strings.TrimSpace(p) != "" {
			out = append(out, strings.TrimSpace(p))
		}
	}
	return strings.Join(out, sep)
}

func formatDateRange(start, end string, current bool) string {
	start = formatMonth(start)
	if current {
		if start != "" {
			return start + " - Present"
		}
		return "Present"
	}
	end = formatMonth(end)
	if start != "" && end != "" {
		return start + " - " + end
	}
	return start + end
}

func formatMonth(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	if len(s) == 4 {
		return s
	}
	if len(s) >= 7 {
		if t, err := time.Parse("2006-01", s[:7]); err == nil {
			return t.Format("Jan 2006")
		}
	}
	return s
}

func hexToRGB(hex string) (int, int, int) {
	hex = strings.TrimPrefix(hex, "#")
	if len(hex) != 6 {
		return 37, 99, 235
	}
	var r, g, b int
	fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	return r, g, b
}
