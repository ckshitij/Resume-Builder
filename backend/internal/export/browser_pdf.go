package export

import (
	"context"
	"os"
	"strconv"
	"time"

	"github.com/chromedp/cdproto/emulation"
	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

// Letter size at 96 CSS px/in; deviceScaleFactor 2 yields ~192 DPI text rendering.
const (
	pdfViewportWidth  = 816  // 8.5in
	pdfViewportHeight = 1056 // 11in
)

func pdfDeviceScaleFactor() float64 {
	if v := os.Getenv("PDF_DEVICE_SCALE_FACTOR"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil && f >= 1 && f <= 3 {
			return f
		}
	}
	return 2
}

func GeneratePDFFromHTML(html string) ([]byte, error) {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("hide-scrollbars", true),
		chromedp.Flag("font-render-hinting", "medium"),
	)
	if path := os.Getenv("CHROMIUM_PATH"); path != "" {
		opts = append(opts, chromedp.ExecPath(path))
	}

	scale := pdfDeviceScaleFactor()

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	var pdf []byte
	err := chromedp.Run(ctx,
		chromedp.Navigate("about:blank"),
		chromedp.ActionFunc(func(ctx context.Context) error {
			return emulation.SetDeviceMetricsOverride(
				pdfViewportWidth,
				pdfViewportHeight,
				scale,
				false,
			).Do(ctx)
		}),
		chromedp.ActionFunc(func(ctx context.Context) error {
			tree, err := page.GetFrameTree().Do(ctx)
			if err != nil {
				return err
			}
			return page.SetDocumentContent(tree.Frame.ID, html).Do(ctx)
		}),
		chromedp.WaitReady("body", chromedp.ByQuery),
		chromedp.Sleep(500*time.Millisecond),
		chromedp.ActionFunc(func(ctx context.Context) error {
			buf, _, err := page.PrintToPDF().
				WithPrintBackground(true).
				WithPreferCSSPageSize(true).
				WithPaperWidth(8.5).
				WithPaperHeight(11).
				WithMarginTop(0).
				WithMarginBottom(0).
				WithMarginLeft(0).
				WithMarginRight(0).
				Do(ctx)
			if err != nil {
				return err
			}
			pdf = buf
			return nil
		}),
	)
	if err != nil {
		return nil, err
	}
	return pdf, nil
}
