==========================================
Report PDF Preview (mj_report_preview)
==========================================

This module adds a full screen PDF preview step before any report is downloaded
in Odoo. Instead of a PDF landing straight in the browser's download folder,
the document is first shown in a dialog where the user can read it, check that
it is the right one, and only then click **Download**.

The report is rendered once: the very same file shown in the preview is the file
saved on download, so there is no second server round trip and no risk of getting
a different document than the one reviewed.

It works for every ``qweb-pdf`` report of the system - Print menus, wizard
buttons, server actions - with no change to existing reports or code.

====================================
Features
====================================

- Full screen preview dialog for every ``qweb-pdf`` report in the database.
- Works everywhere out of the box: Print menus, wizard buttons and server actions.
- Single render: the previewed file is exactly the file downloaded.
- Zoom control with Fit width, Fit page and 50% to 200% levels.
- The chosen zoom is remembered per browser and reused for the next preview.
- The real report file name is shown in the dialog and used on download.
- Per report bypass: add ``skip_pdf_preview: True`` to the context of an action
  to keep the standard direct download for that report.
- Graceful fallback: if the PDF engine is unavailable or an error occurs, Odoo's
  standard report flow takes over.
- No new models, no new access rights, no configuration needed.

====================================
Installation
====================================

1. Place the module in your custom addons directory
2. Update apps list
3. Install **Report PDF Preview (mj_report_preview)** module from the Apps menu.

====================================
Usage
====================================

Nothing to configure. Print any report as usual and the preview dialog opens.

To skip the preview for a specific report, add ``skip_pdf_preview: True`` to the
context of its action::

    <record id="action_report_my_document" model="ir.actions.report">
        <field name="context">{'skip_pdf_preview': True}</field>
    </record>

====================================
Author
====================================

Developed by Musleh Uddin Juned

====================================
License
====================================

LGPL-3
