import { Component, signal, t, useProps } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";

const ZOOM_STORAGE_KEY = "mj_report_preview.zoom";
const DEFAULT_ZOOM = "100";

export const ZOOM_LEVELS = [
    { value: "fit-width", label: _t("Fit width") },
    { value: "fit-page", label: _t("Fit page") },
    { value: "50", label: "50%" },
    { value: "75", label: "75%" },
    { value: "100", label: "100%" },
    { value: "125", label: "125%" },
    { value: "150", label: "150%" },
    { value: "200", label: "200%" },
];

/** Zoom the user picked the last time they previewed a report. */
export function getStoredZoom() {
    let stored;
    try {
        stored = browser.localStorage.getItem(ZOOM_STORAGE_KEY);
    } catch {
        stored = null;
    }
    return ZOOM_LEVELS.some((level) => level.value === stored) ? stored : DEFAULT_ZOOM;
}

/**
 * Full screen dialog showing a rendered PDF report before it is downloaded.
 * The PDF is received as a Blob URL, so the file shown here is exactly the
 * file that gets saved when the user clicks "Download".
 */
export class PdfPreviewDialog extends Component {
    static template = "mj_report_preview.PdfPreviewDialog";
    static components = { Dialog };
    props = useProps({
        close: t.function(),
        objectUrl: t.string(),
        filename: t.string(),
        title: t.string().optional(),
    });

    setup() {
        this.zoomLevels = ZOOM_LEVELS;
        this.state = { zoom: signal(getStoredZoom()) };
    }

    get dialogTitle() {
        return String(this.props.title || _t("Print Preview"));
    }

    /** PDF open parameters understood by the browsers' built-in viewers. */
    get zoomParam() {
        const zoom = this.state.zoom();
        if (zoom === "fit-width") {
            return "view=FitH";
        }
        if (zoom === "fit-page") {
            return "view=Fit";
        }
        return `zoom=${zoom}`;
    }

    get viewerUrl() {
        return `${this.props.objectUrl}#toolbar=1&navpanes=0&${this.zoomParam}`;
    }

    onZoomChange(ev) {
        this.state.zoom.set(ev.target.value);
        try {
            browser.localStorage.setItem(ZOOM_STORAGE_KEY, this.state.zoom());
        } catch {
            // private mode / storage full: the zoom still applies to this preview
        }
    }

    onDownload() {
        const link = document.createElement("a");
        link.href = this.props.objectUrl;
        link.download = this.props.filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}
