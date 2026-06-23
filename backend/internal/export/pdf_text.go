package export

import "strings"

// pdfSafeText replaces Unicode punctuation with ASCII equivalents.
// Core PDF fonts (Helvetica) only reliably render Latin-1 characters.
func pdfSafeText(s string) string {
	if s == "" {
		return s
	}
	replacer := strings.NewReplacer(
		"\u00b7", " | ", // middle dot ·
		"\u2022", "- ",  // bullet •
		"\u2014", " - ", // em dash —
		"\u2013", " - ", // en dash –
		"\u2192", " -> ", // arrow →
		"\u2190", " <- ",
		"\u2018", "'",
		"\u2019", "'",
		"\u201c", "\"",
		"\u201d", "\"",
		"\u2026", "...",
	)
	return replacer.Replace(s)
}
