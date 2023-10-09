

$(document).ready(function () {

    $(document).on('show', '.accordion', function (e) {
        //$('.accordion-heading i').toggleClass(' ');
        $(e.target).prev('.accordion-heading').addClass('accordion-opened');
    });

    $(document).on('hide', '.accordion', function (e) {
        $(this).find('.accordion-heading').not($(e.target)).removeClass('accordion-opened');
        //$('.accordion-heading i').toggleClass('fa-chevron-right fa-chevron-down');
    });



    var ckEditor = document.getElementById('ckEditor');
    if (ckEditor != undefined && ckEditor != null) {

        ClassicEditor.create(document.querySelector('#ckEditor'), {
            language: 'en',
            filebrowserBrowseUrl: 'path',
            removeButtons: 'Save',
            allowedContent: true,
            extraPlugins: 'videoembed,oembed'
        });
    }


    // function selectFile(fileUrl) {
    //     window.opener.ClassicEditor.tools.callFunction(1, fileUrl);
    // }

    // ClassicEditor.on('dialogDefinition', function (ev) {
    //     var editor = ev.editor;
    //     var dialogDefinition = ev.data.definition;

    //     // This function will be called when the user will pick a file in file manager
    //     var cleanUpFuncRef = ClassicEditor.tools.addFunction(function (a) {
    //         $('#ck_file_manager').modal('hide');
    //         ClassicEditor.tools.callFunction(1, a, "");
    //     });
    //     var tabCount = dialogDefinition.contents.length;
    //     for (var i = 0; i < tabCount; i++) {
    //         var browseButton = dialogDefinition.contents[i].get('browse');
    //         if (browseButton !== null) {
    //             browseButton.onClick = function (dialog, i) {
    //                 editor._.filebrowserSe = this;
    //                 var iframe = $('#ck_file_manager').find('iframe').attr({
    //                     src: editor.config.filebrowserBrowseUrl + '&CKEditor=body&CKEditorFuncNum=' + cleanUpFuncRef + '&langCode=en'
    //                 });
    //                 $('#ck_file_manager').appendTo('body').modal('show');
    //             }
    //         }
    //     }
    // });
    // ClassicEditor.on('instanceReady', function (evt) {
    //     $(document).on('click', '.btn_ck_add_image', function () {
    //         if (evt.editor.name != undefined) {
    //             evt.editor.execCommand('image');
    //         }
    //     });
    //     $(document).on('click', '.btn_ck_embed_media', function () {
    //         if (evt.editor.name != undefined) {
    //             evt.editor.execCommand('oembed');
    //         }
    //     });
    //     $(document).on('click', '.btn_ck_add_video', function () {
    //         if (evt.editor.name != undefined) {
    //             evt.editor.execCommand('videoembed');
    //         }
    //     });
    //     $(document).on('click', '.btn_ck_add_iframe', function () {
    //         if (evt.editor.name != undefined) {
    //             evt.editor.execCommand('iframe');
    //         }
    //     });
    // });
})
$(document).ready(function () {

    "use strict";

    // Preloader js
    $(window).load(function () {
        $('#preloader').fadeOut('slow', function () {
            $(this).remove();
        });
    });


    // ************ Login popup
    $('.js-modal-show').on('click', function (e) {
        $('.js-modal-shopify').toggleClass('is-shown--off-flow').toggleClass('is-hidden--off-flow');
    });
    $('.js-modal-hide').on('click', function (e) {
        $('.js-modal-shopify').toggleClass('is-shown--off-flow').toggleClass('is-hidden--off-flow');
    });

    // ************Mean Menu

    $(".search_btn").on("click", function (event) {
        event.preventDefault();
        $("#search").addClass("open");
        $("#search > form > input[type='search']").focus();
    });

    $("#search, #search button.close").on("click keyup", function (event) {
        if (event.target == this || event.target.className == "close" || event.keyCode == 27) {
            $(this).removeClass("open");
        }
    });



    //=========== Scroll to top 
    jQuery('.to-top').on('click', function (event) {
        jQuery('html,body').animate({
            scrollTop: 0
        }, 1000);
    });
    jQuery(window).scroll(function () {
        if (jQuery(window).scrollTop() > 100) {
            jQuery('.to-top').fadeIn(1000);
        } else {
            jQuery('.to-top').fadeOut(1000);
        };
    });

});

window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-EJSPY1D5VC');

