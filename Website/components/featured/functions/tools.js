


export default function Editor() {


    const EDITOR_JS_TOOLS = {

        toolbar: {
            items: [
                'bold',
                'italic',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                // 'mediaEmbed',
                'undo',
                'redo',
                // 'CKFinder',
                'heading',
                'alignment',
                'fontBackgroundColor',
                'fontColor',
                'fontSize',
                'fontFamily',
                'removeFormat',
                'specialCharacters',
                'textPartLanguage',
                'underline'
            ]
        },
        language: 'en',
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side',
                'imageStyle:block',
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableCellProperties',
                'tableProperties'
            ]
        },
        fontSize: {
            options: [7, 8, 9, 10, 11, 12, 'default', 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 45],
            supportAllValues: true
        },
        ckfinder: {
            // Upload the images to the server using the CKFinder QuickUpload command.
            uploadUrl: `/api/v1/upload?field=editor-images&&destination=${Date.now()}`
        },
        licenseKey: '',
        link: {
            // Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
            addTargetToExternalLinks: true,

            // Let the users control the "download" attribute of each link.
            decorators: [
                {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'download'
                    }
                }
            ]
        }
    }


    return EDITOR_JS_TOOLS


}
