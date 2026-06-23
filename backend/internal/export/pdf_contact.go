package export

import (
	"bytes"
	"fmt"
	"net/url"
	"strings"

	"github.com/jung-kurt/gofpdf"

	"github.com/resume-builder/backend/internal/assets"
	"github.com/resume-builder/backend/internal/models"
)

const (
	contactIconLinkedIn = "contact-linkedin"
	contactIconGitHub   = "contact-github"
	contactIconSize     = 3.2
)

func registerContactIcons(pdf *gofpdf.Fpdf) error {
	for _, pair := range []struct{ name, file string }{
		{contactIconLinkedIn, "icons/linkedin.png"},
		{contactIconGitHub, "icons/github.png"},
	} {
		data, err := assets.Icons.ReadFile(pair.file)
		if err != nil {
			return fmt.Errorf("read icon %s: %w", pair.file, err)
		}
		info := pdf.RegisterImageOptionsReader(pair.name, gofpdf.ImageOptions{ImageType: "PNG"}, bytes.NewReader(data))
		if info == nil {
			return fmt.Errorf("register icon %s failed: %v", pair.name, pdf.Error())
		}
	}
	return nil
}

type contactItem struct {
	iconKey string
	text    string
}

func buildContactItems(pi models.PersonalInfo) []contactItem {
	var items []contactItem
	add := func(text string) {
		text = strings.TrimSpace(text)
		if text != "" {
			items = append(items, contactItem{text: text})
		}
	}
	add(pi.Email)
	add(pi.Phone)
	add(pi.Location)
	if pi.Website != "" {
		add(displayURL(pi.Website))
	}
	if pi.LinkedIn != "" {
		items = append(items, contactItem{
			iconKey: contactIconLinkedIn,
			text:    displayURL(pi.LinkedIn),
		})
	}
	if pi.GitHub != "" {
		items = append(items, contactItem{
			iconKey: contactIconGitHub,
			text:    displayURL(pi.GitHub),
		})
	}
	return items
}

func writeContactLine(pdf *gofpdf.Fpdf, pi models.PersonalInfo, fontSize float64) error {
	if err := registerContactIcons(pdf); err != nil {
		return err
	}

	items := buildContactItems(pi)
	if len(items) == 0 {
		return nil
	}

	left, _, right, _ := pdf.GetMargins()
	pageW, _ := pdf.GetPageSize()
	maxW := pageW - left - right
	lineH := fontSize * 0.45
	if lineH < 4.5 {
		lineH = 4.5
	}

	pdf.SetFont("Helvetica", "", fontSize)
	pdf.SetTextColor(40, 40, 40)

	x := pdf.GetX()
	y := pdf.GetY()
	firstOnLine := true
	sep := " | "
	sepW := pdf.GetStringWidth(sep)

	for _, item := range items {
		text := pdfSafeText(item.text)
		textW := pdf.GetStringWidth(text)
		itemW := textW
		if item.iconKey != "" {
			itemW += contactIconSize + 0.8
		}
		if !firstOnLine {
			itemW += sepW
		}

		if !firstOnLine && x-left+itemW > maxW {
			y += lineH + 0.8
			x = left
			firstOnLine = true
			itemW = textW
			if item.iconKey != "" {
				itemW += contactIconSize + 0.8
			}
		}

		if !firstOnLine {
			pdf.SetXY(x, y)
			pdf.Write(lineH, sep)
			x = pdf.GetX()
		}

		if item.iconKey != "" {
			pdf.Image(item.iconKey, x, y+0.2, contactIconSize, contactIconSize, false, "", 0, "")
			x += contactIconSize + 0.8
		}

		pdf.SetXY(x, y)
		pdf.Write(lineH, text)
		x = pdf.GetX()
		firstOnLine = false
	}

	pdf.SetXY(left, y+lineH+1.2)
	return nil
}

func displayURL(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	href := raw
	if !strings.HasPrefix(href, "http://") && !strings.HasPrefix(href, "https://") {
		href = "https://" + href
	}
	u, err := url.Parse(href)
	if err != nil {
		return strings.TrimPrefix(strings.TrimPrefix(raw, "https://"), "http://")
	}
	host := strings.TrimPrefix(u.Hostname(), "www.")
	path := strings.TrimSuffix(u.Path, "/")
	if host == "github.com" && path != "" {
		return "github.com" + path
	}
	if host == "linkedin.com" && path != "" {
		return "linkedin.com" + path
	}
	if path != "" && path != "/" {
		if len(path) > 28 {
			path = path[:26] + "..."
		}
		return host + path
	}
	return host
}
