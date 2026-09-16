import { registry } from "@web/core/registry";
import { browser } from "@web/core/browser/browser";
import { rpc } from "@web/core/network/rpc";
import { user } from "@web/core/user";
import { _t } from "@web/core/l10n/translation";
import { getReportUrl } from "@web/webclient/actions/reports/utils";
import { PdfPreviewDialog } from "./pdf_preview_dialog";

const DEFAULT_FILENAME = "report.pdf";

/**
 * Read the file name out of a Content-Disposition header.
 * Handles both `filename="x.pdf"` and `filename*=UTF-8''x.pdf`.
 */
function parseFilename(contentDisposition) {
    if (!contentDisposition) {
        return DEFAULT_FILENAME;
    }
    const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
    if (encoded) {
        try {
            return decodeURIComponent(encoded[1].trim());
        } catch {
            // fall through to the plain filename
        }
    }
    const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition);
    return plain ? plain[1].trim() : DEFAULT_FILENAME;
}

/**
 * Handler registered on the "ir.actions.report handlers" registry.
 *
 * Returning a falsy value lets Odoo handle the action the standard way
 * (straight download), so every unexpected situation degrades gracefully.
 *
 * Returning a truthy value tells the action service the report has been
 * delivered; the service itself takes care of `close_on_report_download`
 * and of the `onClose` callback.
 */
async function pdfPreviewHandler(action, options, env) {
    if (action.report_type !== "qweb-pdf") {
        return false;
    }
    const actionContext = action.context || {};
    if (actionContext.skip_pdf_preview) {
        return false;
    }

    // Same wkhtmltopdf sanity check as the standard flow: when it is missing or
    // broken, let Odoo fall back to its HTML report.
    try {
        pdfPreviewHandler.wkhtmltopdfStatusProm ||= rpc("/report/check_wkhtmltopdf");
        const status = await pdfPreviewHandler.wkhtmltopdfStatusProm;
        if (!["upgrade", "ok"].includes(status)) {
            return false;
        }
    } catch {
        return false;
    }

    const downloadContext = { ...user.context, ...actionContext };
    const url = getReportUrl(action, "pdf", user.context);

    let blob;
    let filename = DEFAULT_FILENAME;
    env.services.ui.block();
    try {
        const formData = new FormData();
        formData.append("data", JSON.stringify([url, action.report_type]));
        formData.append("context", JSON.stringify(downloadContext));
        formData.append("token", "dummy-because-api-expects-one");
        if (odoo.csrf_token) {
            formData.append("csrf_token", odoo.csrf_token);
        }
        const response = await browser.fetch("/report/download", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            // Let the standard flow run so the user gets Odoo's own error.
            return false;
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/pdf")) {
            return false;
        }
        filename = parseFilename(response.headers.get("content-disposition"));
        blob = await response.blob();
    } catch {
        return false;
    } finally {
        env.services.ui.unblock();
    }

    const objectUrl = URL.createObjectURL(blob);
    await new Promise((resolve) => {
        env.services.dialog.add(
            PdfPreviewDialog,
            {
                objectUrl,
                filename,
                title: action.display_name || action.name || _t("Print Preview"),
            },
            {
                onClose: () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve();
                },
            }
        );
    });

    return true;
}

registry
    .category("ir.actions.report handlers")
    .add("mj_pdf_preview", pdfPreviewHandler, { sequence: 5 });
