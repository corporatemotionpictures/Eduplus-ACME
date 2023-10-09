import Link from 'next/link';
import { Component } from 'react';
import { add, getSettings, fetchAll } from 'helpers/apiService';

import define from 'src/json/worddefination.json'
import WebsiteShimmer from 'components/website/shimmer/websiteShimmer';
import SliderShimmer from './shimmer/slider-shimmer';

export default class extends Component {

  // / Set state
  state = {
    contacts: {},
    sliders: [],
    loading: true,
  };


  loadScript = async (filename, callback) => {

    var len = $(`script[src*="${filename}"]`).length;
    if (len == 0) {
      var fileref = document.createElement('script');
      fileref.setAttribute("type", "text/javascript");
      fileref.onload = callback;
      fileref.setAttribute("src", filename);
      if (typeof fileref != "undefined") {
        document.getElementsByTagName("body")[0].appendChild(fileref)
      }
    } else {
      callback()
    }

  }

  loadBaseScript = async () => {


    console.log('sm vms  sdcnsd csndf fknwef wekfwk ekwed ')
    this.loadScript('/website/assets/js/jquery-3.2.1.min.js', () => {
    });
    this.loadScript('/website/assets/js/revolution/jquery.themepunch.revolution.min.js', () => {
      this.loadScript('/website/assets/js/revolution/jquery.themepunch.tools.min.js', () => {
        this.loadScript('/website/assets/js/jquery.meanmenu.min.js', () => {
          this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.actions.min.js', () => {
            this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.carousel.min.js', () => {
              this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.kenburn.min.js', () => {
                this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.layeranimation.min.js', () => {
                  this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.migration.min.js', () => {
                    this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.navigation.min.js', () => {
                      this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.parallax.min.js', () => {
                        this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.slideanims.min.js', () => {
                          this.loadScript('/website/assets/js/revolution/extensions/revolution.extension.video.min.js', () => {


                            this.setState({
                              loading: false
                            }, () => {


                              jQuery('#rev_slider_1').show().revolution({
                                /* Options are 'auto', 'fullwidth' or 'fullscreen' */
                                sliderType: "standard",
                                jsFileLocation: "website/assets/js/revolution/",
                                sliderLayout: "fullwidth",
                                dottedOverlay: "none",
                                delay: 9000,
                                navigation: {
                                  keyboardNavigation: "off",
                                  keyboard_direction: "horizontal",
                                  mouseScrollNavigation: "off",
                                  mouseScrollReverse: "default",
                                  onHoverStop: "off",
                                  bullets: {
                                    enable: true,
                                    hide_onmobile: false,
                                    style: "bullet-bar",
                                    hide_onleave: false,
                                    direction: "vertical",
                                    h_align: "right",
                                    v_align: "center",
                                    h_offset: 250,
                                    v_offset: 0,
                                    space: 5,
                                    tmp: ''
                                  }
                                },
                                responsiveLevels: [1200, 1024, 778, 480],
                                visibilityLevels: [1200, 1024],
                                gridwidth: [1200, 1024,],
                                gridheight: [600, 1000, 960, 500],
                                lazyType: "none",
                                shadow: 0,
                                spinner: "off",
                                stopLoop: "off",
                                stopAfterLoops: -1,
                                stopAtSlide: -1,
                                shuffle: "off",
                                autoHeight: "off",
                                fullScreenAutoWidth: "off",
                                fullScreenAlignForce: "off",
                                fullScreenOffsetContainer: "",
                                fullScreenOffset: "60px",
                                hideThumbsOnMobile: "off",
                                hideSliderAtLimit: 0,
                                hideCaptionAtLimit: 0,
                                hideAllCaptionAtLilmit: 0,
                                debugMode: false,
                                fallbacks: {
                                  simplifyAll: "off",
                                  nextSlideOnWindowFocus: "off",
                                  disableFocusListener: false,
                                }
                              });



                            })



                          })
                        });
                      });
                    });
                  });
                });
              });
            })
          })
        })
      });
    })

  }


  componentDidMount() {
    this.loadBaseScript()
  }


  render() {
    let contacts = this.props.contacts
    return (
      <div className="slider-space">
        <div className="rev_slider_wrapper slider-sm-m " id="rev_slider_wrapper">
          {this.props.sliders && this.props.sliders.length > 0 && <div id="rev_slider_1" className="rev_slider pt-5" >
            <ul>
              {
                this.props.sliders && this.props.sliders.map((slider, index) => {
                  return <li data-index={`rs-${index}`} data-transition="fade" data-slotamount="7" data-hideafterloop="0" data-hideslideonmobile="off" data-easein="default" data-easeout="default" data-masterspeed="1000" data-rotate="0" data-saveperformance="off" data-title="Slide" data-param1="" data-param2="" data-param3="" data-param4="" data-param5="" data-param6="" data-param7="" data-param8="" data-param9="" data-param10="" data-description="">

                    <div className="slider-overlay"></div>



                    <img src={slider.image} alt={window.localStorage.getItem('defaultImageAlt')} className="rev-slidebg" data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat" data-bgparallax="10" className="rev-slidebg" data-no-retina />



                    <div className="lg-p-t tp-caption font-lora sfb tp-resizeme letter-space-5 h-p"
                      data-x="['left','left','left','left']" data-hoffset="['0','0','100','100']"
                      data-y="['middle','middle','middle','middle']" data-voffset="['-200','-280','-250','-200']"
                      data-fontsize="['20','40','40','28']"
                      data-lineheight="['70','80','70','70']"
                      data-width="none"
                      data-height="none"
                      data-whitespace="nowrap"
                      data-type="text"
                      data-responsive_offset="on"
                      data-frames='[{"from":"z:0;rX:0;rY:0;rZ:0;sX:0.9;sY:0.9;skX:0;skY:0;opacity:0;","speed":400,"to":"o:1;","delay":100,"split":"chars","splitdelay":0.05,"ease":"Power3.easeInOut"},{"delay":"wait","speed":100,"to":"y:[100%];","mask":"x:inherit;y:inherit;s:inherit;e:inherit;","ease":"Power2.easeInOut"}]'
                      style={{ zIndex: 7, color: "#fff", fontFamily: 'Roboto', maxWidth: 'auto', maxHeight: 'auto', whiteSpace: "nowrap", fontWeight: "500", marginTop: '100px' }}>{slider.sub_title}
                    </div>

                    {slider.upper_title && <div className=" lg-p-t tp-caption font-lora sfb tp-resizeme "
                      data-x="['left','left','left','left']" data-hoffset="['0','0','100','100']"
                      data-y="['middle','middle','middle','middle']" data-voffset="['-120','-140','-140','-120']"
                      data-fontsize="['65','120','100','70']"
                      data-lineheight="['70','120','70','70']"
                      data-width="none"
                      data-height="none"
                      data-whitespace="nowrap"
                      data-type="text"
                      data-responsive_offset="on"
                      data-frames='[{"from":"z:0;rX:0;rY:0;rZ:0;sX:0.9;sY:0.9;skX:0;skY:0;opacity:0;","speed":400,"to":"o:1;","delay":100,"split":"chars","splitdelay":0.20,"ease":"Power3.easeInOut"},{"delay":"wait","speed":100,"to":"y:[100%];","mask":"x:inherit;y:inherit;s:inherit;e:inherit;","ease":"Power2.easeInOut"}]'
                      data-textalign="['left','left','left','left']"
                      data-paddingtop="[10,10,10,10]"
                      data-paddingright="[0,0,0,0]"
                      data-paddingbottom="[10,10,10,10]"
                      data-paddingleft="[0,0,0,0]"
                      style={{ zIndex: 5, fontFamily: 'Roboto', fontWeight: 500, whiteSpace: "nowrap", textTransform: "capitalize", color: '#fff', marginTop: '100px' }}>{slider.upper_title}
                    </div>}

                    {slider.lower_title && <div className="lg-p-t tp-caption NotGeneric-Title   tp-resizeme"
                      data-x="['left','left','left','left']" data-hoffset="['0','0','100','100']"
                      data-y="['middle','middle','middle','middle']" data-voffset="['-40','0','-10','-40']"
                      data-fontsize="['65','120','100','70']"
                      data-lineheight="['70','120','70','70']"
                      data-width="none"
                      data-height="none"
                      data-whitespace="nowrap"
                      data-type="text"
                      data-responsive_offset="on"
                      data-frames='[{"from":"z:0;rX:0;rY:0;rZ:0;sX:0.9;sY:0.9;skX:0;skY:0;opacity:0;","speed":400,"to":"o:1;","delay":100,"split":"chars","splitdelay":0.20,"ease":"Power3.easeInOut"},{"delay":"wait","speed":100,"to":"y:[100%];","mask":"x:inherit;y:inherit;s:inherit;e:inherit;","ease":"Power2.easeInOut"}]'
                      data-textalign="['left','left','left','left']"
                      data-paddingtop="[10,10,10,10]"
                      data-paddingright="[0,0,0,0]"
                      data-paddingbottom="[10,10,10,10]"
                      data-paddingleft="[0,0,0,0]"
                      style={{ zIndex: 5, fontFamily: 'Roboto', fontWeight: 500, whiteSpace: "nowrap", textTransform: "capitalize", color: '#fff', marginTop: '100px' }}>{slider.lower_title}
                    </div>}

                    {slider.button_text && <div className="lg-m-t tp-caption rev-btn rev-btn left_btn hvr_button"
                      id="slide-2939-layer-8"
                      data-x="['left','left','left','left']" data-hoffset="['0','0','100','100']"
                      data-y="['middle','middle','middle','middle']" data-voffset="['75','220','190','100']"
                      data-fontsize="['14','14','10','8']"
                      data-lineheight="['34','34','30','20']"
                      data-width="none"
                      data-height="none"
                      data-whitespace="nowrap"
                      data-type="button"
                      data-actions='[{"event":"click","action":"jumptoslide","slide":"rs-2939","delay":""}]'
                      data-responsive_offset="on"
                      data-responsive="off"
                      data-frames='[{"from":"x:-50px;opacity:0;","speed":1000,"to":"o:1;","delay":1750,"ease":"Power2.easeOut"},{"delay":"wait","speed":1500,"to":"opacity:0;","ease":"Power4.easeIn"},{"frame":"hover","speed":"300","ease":"Linear.easeNone","to":"o:1;rX:0;rY:0;rZ:0;z:0;","style":"c:#0e1133;bg:#1c2631;"}]'
                      data-textalign="['left','left','left','left']"
                      data-paddingtop="[12,12,8,8]"
                      data-paddingright="[40,40,30,25]"
                      data-paddingbottom="[12,12,8,8]"
                      data-paddingleft="[40,40,30,25]"
                      style={{ zIndex: 14, fontFamily: 'Roboto', fontWeight: 500, whiteSpace: "nowrap", textTransform: "uppercase", backgroundColor: '#fff', color: '#2b4eff', borderRadius: '3px', marginTop: '40px' }}>

                      {slider.app_button == 1 && contacts && contacts.playStore && contacts.playStore != '' &&

                        JSON.parse(contacts.playStore).map(data => {
                          if (data.playStore != '') {
                            return <Link href={data.playStore}><a target="_blank"><i class="fab fa-google-play ins-icon mr-1"></i>{slider.button_text}</a></Link>

                          }
                        })
                      }
                      {slider.app_button == 0 &&

                        <Link href={slider.button_url}><a target="_blank">{slider.button_text}</a></Link>
                      }
                    </div>}
                  </li>
                })
              }
            </ul>
          </div>}
        </div>

        {
          this.state.loading == true && <div className="margin-t-5 transitions pt-0.5">
            {/* <img src="/images/loader.gif" /> */}
            <SliderShimmer />
            
          </div>
        }

      </div>
    )
  }
}