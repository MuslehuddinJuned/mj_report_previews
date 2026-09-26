{
    'name': 'Report PDF Preview',
    'version': '18.0.1.0.0',
    'summary': 'Always preview a PDF report before downloading it',
    'description': """
Report PDF Preview
==================

Every ``qweb-pdf`` report of the system (Print menus, wizard buttons, server
actions, ...) is first shown in a full screen preview dialog. From there the
user can read the document and download it only if it is the right one.

The report is rendered once: the very same file shown in the preview is the one
saved when clicking *Download*.

The preview opens at 100% zoom; any other zoom the user picks is remembered
(per browser) and reused for the next preview.

To bypass the preview for a specific report, add ``skip_pdf_preview: True`` to
the context of its action.
""",
    'author': 'Musleh Uddin Juned',
    'website': 'http://www.zachai-bachhai.com',
    'category': 'Technical',
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'mj_report_preview/static/src/scss/pdf_preview.scss',
            'mj_report_preview/static/src/js/pdf_preview_dialog.js',
            'mj_report_preview/static/src/xml/pdf_preview_dialog.xml',
            'mj_report_preview/static/src/js/report_preview_handler.js',
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': True,
    'application': False,
    'license': 'LGPL-3',
}
