import Link from "next/link";
import define from 'src/json/worddefination.json'
import * as Icon from 'react-icons/fi'
import * as IconMD from 'react-icons/md'
import * as IconGI from 'react-icons/gi'
import * as IconBI from 'react-icons/bi'
import { element } from "prop-types";
import React from "react";
import moment from "moment";
import ReactDOM from 'react-dom';
import { fileUpload } from 'helpers/apiService'
// import InlineEditor from '@ckeditor/ckeditor5-build-inline';

let applyEditor = (id) => {

  console.log('dvkdsnkn')
  if (document.querySelector('.ck-editor__editable')) {
    delete window.editor
    document.querySelectorAll('.ck-editor__editable').forEach(edit => {
      edit.ckeditorInstance.destroy()
    })

  }

  if (!window.editor || !window.editor[`${id}`]) {
    var EDITOR_JS_TOOLS = require('components/featured/functions/tools').default
    EDITOR_JS_TOOLS = EDITOR_JS_TOOLS()
    var ClassicEditor = require('public/custom-packages/ckeditor5/build/ckeditor')
    document.querySelector(`#${id}`).style.opacity = 1
    ClassicEditor
      .create(document.querySelector(`#${id}`), EDITOR_JS_TOOLS)
      .then(editor => {

        if (!window.editor) {
          window.editor = []
        }
        console.log(editor)
        window.editor[`${id}`] = editor;
      })
      .catch(error => {
        console.error('There was a problem initializing the editor.', error);
      });
  } else {
    console.log('existed')
  }
}

if (typeof window === 'object') {
  // Check if document is finally loaded
  document.addEventListener('click', function (event) {

    // event.preventDefault()
    let targetElement = false;

    for (let i = 0; i < document.getElementsByClassName('section-base').length; i++) {
      if (document.getElementsByClassName('section-base')[i].contains(event.target)) {
        targetElement = true
      }
    }

    if (!targetElement) {
      if (document.querySelector('.ck-editor__editable')) {
        delete window.editor
        document.querySelectorAll('.ck-editor__editable').forEach(edit => {
          edit.ckeditorInstance.destroy()
        })

      }
    }


  });


}


export function prerenderer() {

  document.querySelectorAll("[contenteditable=true]").forEach(edit => {

    let id = edit.getAttribute('id')
    console.log('sdjnvjsd')

    // Get the placeholder attribute
    const placeholder = edit.getAttribute('data-placeholder');

    // Set the placeholder as initial content if it's empty
    (edit.innerHTML === '') && (edit.innerHTML = placeholder) && (edit.style.opacity = 0.4);

    edit.addEventListener('focus', function (e) {
      const value = edit.innerHTML;
      value === placeholder && (edit.innerHTML = '') && (edit.style.opacity = 1);
    });

    edit.addEventListener('blur', function (e) {
      const value = edit.innerHTML;

      console.log(value)
      value != '' && (edit.style.opacity = 1);
      value === '' && (edit.innerHTML = placeholder) && (edit.style.opacity = 0.4);
    });

    $(document).on('click', `#${id}`, function (e) {

      e.preventDefault()
      let div = document.getElementById(id)
      console.log('msdc snc sc s cs cs n')

      $('.editableSection').remove()
      console.log($(`#${id}`).html())
      // console.log(  $(`<div id=${'editable-' + id}  data-id=${id}  className="editableSection"></div>`).insertBefore($(`#${id}`)))
      $(`<div id=${'editable-' + id}  data-id=${id}  className="editableSection"></div>`).insertBefore($(`#${id}`))


      if ($(`#${id}`).attr('data-type') == 'textarea') {
        applyEditor(id)
      }
      ReactDOM.render(
        <EditableOptions id={id} />,
        document.getElementById(`${'editable-' + id}`)
      );

    })

  })



  document.addEventListener('click', function (event) {


    for (let i = 0; i < document.querySelectorAll('.ck-editor').length; i++) {
      event.preventDefault()


      let id = $('.ck-editor').prev().attr('id')
      console.log(id)
      if (document.querySelectorAll('.ck-editor')[i].contains(event.target)) {
        console.log('sn fns n')
      } else {
        if (!document.getElementById(id).contains(event.target) && (!document.querySelector(`[data-id=${id}]`) || !document.querySelector(`[data-id=${id}]`).contains(event.target))) {

          if (document.querySelector('.ck-editor__editable') && window.editor && window.editor[`${id}`]) {

            delete window.editor[`${id}`]
            document.querySelector('.ck-editor__editable').ckeditorInstance.destroy()

            // Get the placeholder attribute
            const placeholder = document.querySelector(`#${id}`).getAttribute('data-placeholder');
            const value = document.querySelector(`#${id}`).innerHTML;

            value != '' && (document.querySelector(`#${id}`).style.opacity = 1);
            value === '' && (document.querySelector(`#${id}`).innerHTML = placeholder) && (document.querySelector(`#${id}`).style.opacity = 0.4);
          }
        } else {
          console.log('sjcjscnjn')
        }
      }
    }

    for (let i = 0; i < document.querySelectorAll('[classname=editableSection]').length; i++) {
      if (document.querySelectorAll('[classname=editableSection]')[i].contains(event.target)) {
        console.log('sn fns n')
      } else {
        if (document.querySelectorAll('[classname=editableSection]')[i].getAttribute('data-id') != event.target.getAttribute('id')) {
          document.querySelectorAll('[classname=editableSection]')[i].remove()
        }
      }
    }

  })

}

function buildFileSelector(id) {

  if (document.getElementById(id).getAttribute('contenteditable') == 'true') {

    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('data-id', `${id}`);

    fileSelector.click();

    fileSelector.onchange = changeFile

    return fileSelector;
  }

}

function changeFile() {

  // console.log(id)
  var input = this;
  var url = this.value;

  let id = $(this).attr('data-id')
  var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
  if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {




    var reader = new FileReader();

    reader.onload = async function (e) {

      let path = null

      let uploadPath = `${id}-${moment().format('DD-MM-YYYY')}`

      let file = await fileUpload('pages', null, input.files[0], 'image', `${uploadPath}`)

      if (file.success == true) {
        path = file.path
        path = path.replace(/uploads/g, "cdn")
      }

      if (!path) {
        path = e.target.result
      }
      $(`#${id}`).attr('src', path);
    }
    reader.readAsDataURL(input.files[0]);
  }
  else {
    // $(`#${id}`).attr('src', '/assets/no_preview.png');
  }
}


export function asignDefaultvalue(pageSections) {


  pageSections.map(pageSection => {

    document.querySelectorAll(`[data-section-id='${pageSection.section_id}'][data-position='${pageSection.position}']`).forEach(section => {
      let section_id = pageSection.section_id
      let position = section.getAttribute('data-position')

      console.log(pageSection.style)
      if (pageSection.style && JSON.parse(pageSection.style)) {
        Object.assign(section.style, JSON.parse(pageSection.style))
      }
      if (pageSection.sectionData) {
        pageSection.sectionData.map(value => {
          // console.log(value)
          let item = section.querySelector(`#${value.item_id}`)

          if (item) {
            let type = item.getAttribute('data-type')

            if (!type || type == 'textarea') {
              item.innerHTML = value.value
            } else if (type == 'image') {
              item.setAttribute('src', value.value.replace(/uploads/g, "cdn"))

              if (value.redirect_url && JSON.parse(value.redirect_url) && JSON.parse(value.redirect_url).url) {

                var parent = item.parentNode;
                var wrapper = document.createElement('a');
                let redirect_url = JSON.parse(value.redirect_url)

                if (parent.nodeName != 'A') {
                  // set the wrapper as child (instead of the element)
                  parent.replaceChild(wrapper, item);
                  // set item as child of wrapper
                  wrapper.appendChild(item);
                }

                parent = item.parentNode
                parent.setAttribute('href', redirect_url.url)
                if (redirect_url.target_blank == 1) {
                  parent.setAttribute('target', "_blank")
                } else {
                  parent.removeAttribute('target')
                }
              }
            }

            let style = JSON.parse(value.style)
            if (style) {
              Object.assign(item.style, style)
              item.setAttribute('data-styles', value.style)
            }
          }
        })
      }
    })

  })
}


export function EditableOptions({ id }) {

  let currentNode = document.getElementById(id)
  if (currentNode) {
    let type = currentNode.getAttribute('data-type')
    return <div className="shadow-sm px-3 py-1 bg-light mb-1 rounded" >
      <div className="row">
        {/* {type == 'textarea' && <div className="col-1 p-2" >
          <Icon.FiEdit size={18} onClick={() => {
            if (type == 'textarea') {
              applyEditor(id)
            }
          }} />
        </div>} */}
        {type == 'image' && <div className="col-1 p-2" >
          <IconMD.MdPhotoSizeSelectActual size={18} onClick={(e) => {
            e.preventDefault()
            if (type == 'image') {
              buildFileSelector(id)
            }
          }} />
        </div>}
        {type == 'image' && <div className="col-1 p-2" onClick={(e) => {

          e.preventDefault()
          $('.aditionalBox').hide()

          if (document.getElementById(`Link${id}`).style.display == 'none') {
            document.getElementById(`Link${id}`).style.display = 'flex'
          } else {
            document.getElementById(`Link${id}`).style.display = 'none'
          }
        }}>
          <Icon.FiExternalLink size={18} />
        </div>}
        {type != 'image' && type != 'textarea' && <div className="col-4 p-2  d-flex">

          <IconBI.BiFontColor size={20} onClick={() => {
            $(`#${`fontColorButton${id}`}`).click();
          }} />
          <input type="color" id={`fontColorButton${id}`} className="color-text" defaultValue={document.getElementById(`${id}`).style.color} title="Change Font Color"
            onChange={(e) => {
              let element = document.getElementById(`${id}`)
              element.style.color = e.target.value
              let attribute = element.getAttribute('data-styles')
              if (attribute) {
                attribute = JSON.parse(attribute)
              } else {
                attribute = {}
              }
              attribute = JSON.stringify({
                ...attribute,
                color: e.target.value
              })

              element.setAttribute('data-styles', attribute)

            }}
          />
        </div>}
        {/* <div className="col-1 p-2" onClick={(e) => {
          e.preventDefault()
          $('.aditionalBox').hide()
          if (document.getElementById(`Align${id}`).style.display == 'none') {
            document.getElementById(`Align${id}`).style.display = 'flex'
          } else {
            document.getElementById(`Align${id}`).style.display = 'none'
          }
        }}>
          <Icon.FiAlignCenter size={18} />
        </div> */}
        {/* <div className="col-1 p-2">
          <IconMD.MdPhotoSizeSelectLarge size={18} onClick={() => {
            var elementResizeDetectorMaker = require("element-resize-detector");
            var erd = elementResizeDetectorMaker();
            var erdUltraFast = elementResizeDetectorMaker({
              strategy: "scroll" //<- For ultra performance.
            });
            erd.listenTo(document.getElementById(id), function (element) {
              var width = element.offsetWidth;
              var height = element.offsetHeight;
              console.log("Size: " + width + "x" + height);
            });

            var elementResizeEvent = require("element-resize-event")

            var element = document.getElementById("")

            elementResizeEvent(element, function () {
              console.log("resized!")
              console.log(element.offsetWidth)
            })
          }} />
        </div> */}
        {/* <div className="col-1 p-2">
          <IconGI.GiResize size={18} />
        </div> */}
        {/* <div className="col-1 p-2">
          <Icon.FiTrash size={18} />
        </div>
        <div className="col-1 p-2">
          <Icon.FiCopy size={18} />
        </div> */}
      </div>
      <div className="row border-top aditionalBox" id={`Align${id}`} style={{ display: "none" }}>
        <div className="col-1 p-2">
          <Icon.FiAlignCenter size={18} />
        </div>
        <div className="col-1 p-2">
          <Icon.FiAlignJustify size={18} />
        </div>
        <div className="col-1 p-2">
          <Icon.FiAlignLeft size={18} />
        </div>
        <div className="col-1 p-2">
          <Icon.FiAlignRight size={18} />
        </div>

      </div>
      <div className="row border-top aditionalBox" id={`Link${id}`} style={{ display: "none" }}>
        <div className="col-4 p-1">
          <input type="text" className="form-control" id={`linkImage${id}`} placeholder="Link"
            defaultValue={document.getElementById(id).parentNode && document.getElementById(id).parentNode.nodeName == 'A' && document.getElementById(id).parentNode.getAttribute('href') ? document.getElementById(id).parentNode.getAttribute('href') : ''}
          />
        </div>
        <div className="col-2 p-1">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id={`targetBlank${id}`} value="1"
              defaultChecked={document.getElementById(id).parentNode && document.getElementById(id).parentNode.nodeName == 'A' && document.getElementById(id).parentNode.getAttribute('target') ? true : false}
            />
            <label className="form-check-label" for={`targetBlank${id}`}>Target Blank</label>
          </div>
        </div>
        <div className="col-2 p-1">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id={`removeLink${id}`} />
            <label className="form-check-label" for={`removeLink${id}`}>Remove Link</label>
          </div>
        </div>
        <div className="col-3 p-1">
          <div className="form-check">
            <input type="submit" className="btn btn-primary" value="Apply" onClick={(e) => {
              // `element` is the element you want to wrap
              e.preventDefault()
              let element = document.getElementById(id)
              var parent = element.parentNode;
              var wrapper = document.createElement('a');

              if (document.getElementById(`removeLink${id}`).checked) {
                if (parent.nodeName == 'A') {
                  parent.parentNode.replaceChild(element, parent);
                }
              }
              else {

                if (parent.nodeName != 'A') {
                  // set the wrapper as child (instead of the element)
                  parent.replaceChild(wrapper, element);
                  // set element as child of wrapper
                  wrapper.appendChild(element);
                }

                parent = element.parentNode
                parent.setAttribute('href', document.getElementById(`linkImage${id}`).value)
                if (document.getElementById(`targetBlank${id}`).checked) {
                  parent.setAttribute('target', "_blank")
                } else {
                  parent.removeAttribute('target')
                }

              }

            }} />
          </div>
        </div>
      </div>
    </div>
  }
}

export function Second({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {

  return (
    <section className="about_top_wrapper section-base" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="title">
              <h2 contenteditable={editable} id={`headingSecond${sectionID}${position}`}>Welcome to Genique Education</h2>
              <p data-type="textarea" contenteditable={editable} id={`body${sectionID}${position}`}>Necessity is the Mother of Invention, and this proverb perfectly defines the inception of Genique Education. Genique Education is a pioneer academy for Mechanical education established by the Petrocrats to endeavor the young talents and make them achieve what they deserve. The advisory council at Genique Education comprises of eminent professors and oil & gas industry professionals...</p>
              <img src="/uploads/banners/1615880181511.jpg" data-type="image" id={`image${sectionID}${position}`} />
              <Link href="/about-us">
                <a title="">Read More <i className="fa fa-angle-right"></i></a>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="items_shape"></div> */}
    </section>
  )
}


export function LeftTextRightImage({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className="h-80vh LeftTextRightImage section-base" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="row align-items-center ">
          <div className="col-sm-6 col-lg-6 ">
            <div className="banner_text">
              <div className="banner_text_iner" id="banner_text_iner">
                <span className="headingText" contenteditable={editable} id={`headingText${sectionID}${position}`} data-placeholder="Header">New Generation</span><br />
                <span className="subHeadingText mt-1" data-placeholder="Sub Header" contenteditable={editable} id={`subHeadingText${sectionID}${position}`}>Learning App for Education Institutes and Training Academies</span>
                <p className="text mt-2" data-placeholder="Text" contenteditable={editable} data-type="textarea" id={`body${sectionID}${position}`}>Onboard your students and train your current teams with a modern, intuitive, fully responsive interface , EduPlus delivers a simpler, more powerful training and learning experience.</p>
                <p className="text mt-5" data-placeholder="Sub Text" contenteditable={editable} id={`text${sectionID}${position}`}>Available on</p>
                <a>

                  <img className="iconImg" contenteditable={editable} data-type="image" id={`iconImage${sectionID}${position}`} src="/images/section-images/platforms.png" /></a>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-6 mt-5 pt-5">
            <img className="w-100 rightImg" contenteditable={editable} data-type="image" id={`image${sectionID}${position}`} src="/images/section-images/intro-eduplus-banner.png" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function AllImage({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className="block mt-5 pt-5 py-5 my-5 AllImage section-base" id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="block__wrapper">
          <div className="row">
            <div className="col-md-6">
              <span className={`heading`} contenteditable={editable} id={`headingText1${sectionID}${position}`} data-placeholder="Header">Creating courses</span>
              <img contenteditable={editable} data-type="image" id={`iconImage1${sectionID}${position}`} className="w-100 rounded" src="/images/section-images/reason-1.jpg" />
              <div className="push-down banner_text">
                <p data-scroll-reveal="enter left and move 10px after 0.1s" className="pt-1" data-type="textarea" contenteditable={editable} id={`body1${sectionID}${position}`} data-placeholder="Text">
                  Create courses from any number of lessons, and quizzes, in any order.<br />We have created an interface that's as intuitive as possible for learners and administrators alike, and EduPlus delivers a simpler, more powerful training and learning experience.
                </p>
              </div>
            </div>
            <div className="col-md-5">
              <span className={`heading`} contenteditable={editable} id={`headingText2${sectionID}${position}`} data-placeholder="Header">Creating teams</span>
              <img contenteditable={editable} data-type="image" id={`iconImage2${sectionID}${position}`} className="w-100 rounded" src="/images/section-images/reason-2.jpg" />
              <div className="push-down banner_text">
                <p data-scroll-reveal="enter left and move 10px after 0.1s" className="pt-1" data-type="textarea" contenteditable={editable} id={`body2${sectionID}${position}`} data-placeholder="Text">
                  Create teams and assign courses to them.For example, you may want to create teams for various departments, such as marketing and sales, Management and Faculties, so you can assign them specific authorities in Admin Panel.<br />You can then use Smart Teams to have learners automatically move to a new team when they've finished the courses in their current team. This allows you to create unique growth paths for different learners — and automate the transitions!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div></section>
  )
}

export function SingleImage({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (


    <section className="block SingleImage section-base" id="gallery" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <hr />
        <div className="block__wrapper">
          <div className="block__title text-center mt-5">
            <h1 className={`heading`} contenteditable={editable} id={`headingText1${sectionID}${position}`} data-placeholder="Header">Customized Branding for your Institute</h1>
          </div>
          <img className="w-100 rounded-corners" contenteditable={editable} data-type="image" id={`singleImage${sectionID}${position}`} src="/images/section-images/screenshots-app.png" />
        </div>
      </div>
    </section>
  )
}

export function SecondImgeText({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className=" SecondImgeText section-base block " id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <hr />
        <div className="block__wrapper py-5">
          <div className="row">
            <div className="col-md-5">
              <div className="push-down banner_text">
                <span className="heading1" contenteditable={editable} id={`headingText${sectionID}${position}`} data-placeholder="Header">For learners</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" className="pt-4" contenteditable={editable} id={`text${sectionID}${position}`} data-placeholder="Text" data-type="textarea">
                  Assign courses to learners or they can buy course their own and build their training program in just a few clicks!<br />
                  Every learner has their own profile, where you can track their learning progress, create notes, and much more.
                </p>
              </div>
            </div>
            <div className="col-md-7">
              <img className="w-100 rounded-corners" contenteditable={editable} data-type="image" id={`image${sectionID}${position}`} src="/images/section-images/reason-3.jpg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LeftImageRightText({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className=" LeftImageRightText section-base block " id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="block__wrapper">
          <div className="row">
            <div className="col-md-5 ">
              <img className="w-100 rounded-corners mt-5" contenteditable={editable} data-type="image" id={`image${sectionID}${position}`} src="/images/section-images/reason-4.jpg" />
            </div>
            <div className="col-md-7 mt-5">
              <div className="push-down banner_text">
                <span className="header" contenteditable={editable} id={`heading${sectionID}${position}`} data-placeholder="Header">Your security is our priority</span> <br />
                <hr className="hr" />
                <span className="subHeader" contenteditable={editable} id={`subHeading1${sectionID}${position}`} data-placeholder="Sub Header">Basic security settings</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" className="pt-4 mb-2" contenteditable={editable} id={`text1${sectionID}${position}`} data-placeholder="Text" data-type="textarea">
                  EduPlus has been working with companies in India since 2020. Our system is fully compliant with the security standards.We have gone one step further and created a Security Center, where you can: Disable text copying, Grant access for specific IP addresses or domains, Enable strong passwords, which prevents your learners from creating simple passwords that are easy to guess (such as "querty" or "abc123").
                </p>
                <span className="subHeader" contenteditable={editable} id={`subHeading2${sectionID}${position}`} data-placeholder="Sub Header">Advanced security settings</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" className="pt-4 mb-2" contenteditable={editable} id={`text2${sectionID}${position}`} data-placeholder="Text" data-type="textarea">
                  For users with Premium plans or higher, we offer even more tools for content protection: <br /> Two-factor authentication, Registration confirmation by mobile number, Limits on the number of devices a learner can use, Watermarks for Videos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


export function RightImageLeftText({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className="top_service our_ability padding_bottom mt-5 pt-5 RightImageLeftText section-base  " id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-12 col-md-5 col-lg-5">
            <div className="our_ability_member_text">
              <h2><span contenteditable={editable} id={`heading1${sectionID}${position}`} data-placeholder="Header 1">Powerful </span>
                <span className="header2" contenteditable={editable} id={`heading2${sectionID}${position}`} data-placeholder="Header 2">Analytics</span></h2>
              <hr />
              <p contenteditable={editable} id={`text1${sectionID}${position}`} data-placeholder="Text" data-type="textarea">Continue your digital transformation and emerge stronger, Our Analytics tool will help you to analyse the user-based informed such as user's learning hours and course completed.<br />
                We put together this series as a guide to help you prepare for the 2021/22 school year.Throughout the series, learn how districts have leveraged the experiences from COVID-19 to propel their digital transformations and emerge stronger for a better future.
              </p>
              <p contenteditable={editable} id={`text2${sectionID}${position}`} data-placeholder="Text" data-type="textarea"> This indicates that teaching & learning could advantage from utilizing these new technological tools. With access to EduPlus, it is possible to make high-quality education available at a reduced cost. Learners get materials on time and improve their learning capabilities. <br />EduPlus provide both systematic and smart learning.It is arranged systematically that it becomes possible for students to go with the flow.</p>
            </div>
          </div>
          <div className="col-12 col-md-7 col-lg-7">
            <img className="width-100 rounded-corners mt-5" contenteditable={editable} data-type="image" id={`image${sectionID}${position}`} src="/images/section-images/analytics-feature.png" />
          </div>
        </div>
      </div>
    </section >
  )
}

export function TextOnly({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className="block TextOnly section-base  py-5" id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <div className="block__wrapper">
          <div className="block__title text-center mt-5">
            <h1 contenteditable={editable} id={`heading${sectionID}${position}`} data-placeholder="Header" className="py-3">We Innovate with the Learner in Mind</h1>
            <p contenteditable={editable} id={`text${sectionID}${position}`} data-placeholder="Text" data-type="textarea" className="mb-5">Foster engagement, interaction and quality learning throughout the student journey with Eduplus's learning management system offerings—from K-12 to higher education and beyond.<br />With a modern, intuitive, fully responsive interface , EduPlus delivers a simpler, more powerful teaching and learning experience that goes beyond the traditional learning management system.EduPlus provide both systematic and smart learning.It is arranged systematically that it becomes possible for students to go with the flow.</p>
          </div>
          <hr />
        </div>
      </div>
    </section>
  )
}


export function imageMulti({ editable = false, sectionID = 0, position = 0, inputTypes = {}, defaultValue = {} }) {
  return (

    <section className="block mb-5 pb-5 imageMulti section-base  " id="text-image-block" data-section-id={sectionID} data-position={position}>
      <div className="container">
        <hr />
        <div className="block__wrapper">
          <div className="row">
            <div className="col-md-4">
              <div className="text-center push-down banner_text">
                <img className="rounded-corners image m-auto" contenteditable={editable} data-type="image" id={`image1${sectionID}${position}`} src="/images/section-images/chat.png" /><br />
                <span className="header header1" contenteditable={editable} id={`heading1${sectionID}${position}`} data-placeholder="Header">Integrating chats</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" contenteditable={editable} id={`text1${sectionID}${position}`} data-placeholder="Text" data-type="textarea" className="pt-2">
                  Add a chat feature to your academy to respond directly to learners' questions.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center push-down banner_text">
                <img className="rounded-corners image m-auto" contenteditable={editable} data-type="image" id={`image2${sectionID}${position}`} src="/images/section-images/discussion.png" /><br />
                <span className="header header2" contenteditable={editable} id={`heading2${sectionID}${position}`} data-placeholder="Header">Academy Discussion Forum</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" contenteditable={editable} id={`text2${sectionID}${position}`} data-placeholder="Text" data-type="textarea" className="pt-2">
                  Keep up with new learners added, allow them to dicuss the important problems with your in-app discussion forum.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center push-down banner_text">
                <img className="rounded-corners image m-auto" contenteditable={editable} data-type="image" id={`image3${sectionID}${position}`} src="/images/section-images/newsfeed.png" /><br />
                <span className="header 3" contenteditable={editable} id={`heading3${sectionID}${position}`} data-placeholder="Header">Academy Newsfeed & Blogs</span>
                <p data-scroll-reveal="enter left and move 10px after 0.1s" contenteditable={editable} id={`text3${sectionID}${position}`} data-placeholder="Text" data-type="textarea" className="pt-2">
                  Keep up with new learners added, and other important events in your academy — you won't want to miss anything!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}





