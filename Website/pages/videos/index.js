import Link from "next/link";
import define from 'src/json/worddefination.json'
import { fetchAll, getSettings } from 'helpers/apiService';
import moment from 'moment';
import React, { useState, useEffect } from 'react';



export default function courses() {

  const [gallery, setGallery] = useState([])
  const [YoutubeAuth, setYoutubeAuth] = useState({})
  const [YoutubeData, setYoutubeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [first, setFirst] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {

        let data = await fetchAll('gallery')
        setGallery(data.gallery)
        data = await getSettings('youtubeAuth')
        setYoutubeAuth(data)
        console.log(data)

      }
    }
    getInnerdata()
    setFirst(false)
    return
  }, [first])

  useEffect(() => {

    const YOUTUBE_PLAYLIST_API = 'https://www.googleapis.com/youtube/v3/playlists';
    const YOUTUBE_PLAYLIST_ITEMS_API = 'https://www.googleapis.com/youtube/v3/playlistItems?&part=snippet%2CcontentDetails';

    var YoutubeData = []
    async function getInnerdata() {

      const res = await fetch(`${YOUTUBE_PLAYLIST_API}?&part=snippet%2CcontentDetails&&key=${YoutubeAuth.youtubeApiKey}&&channelId=${YoutubeAuth.channelID}&order=viewCount&type=video`)
      var data = await res.json();

      if (data && data.items) {

        for (let i = 0; i < data.items.length; i++) {

          let item = data.items[i]

          var { title, thumbnails = {}, resourceId = {} } = item.snippet;
          var { medium } = thumbnails;

          const resVideo = await fetch(`${YOUTUBE_PLAYLIST_ITEMS_API}&&part=snippet%2CcontentDetails&key=${YoutubeAuth.youtubeApiKey}&channelId=${YoutubeAuth.channelID}&playlistId=${item.id}`)
          const dataVideo = await resVideo.json();


          let video = {
            resourceId: resourceId,
            medium: medium,
            title: title,
            id: item.id,
            videos: dataVideo,
          }

          console.log(video)

          YoutubeData.push(video)
        }



      }
      setYoutubeData(YoutubeData)
      setLoading(false)
    }
    console.log(YoutubeData)
    getInnerdata()
    return
  }, [YoutubeAuth])


  return (
    <>
      
      {/* Mid Content Starts */}
      <div className="container page-top mt-3 pt-2">

        {!loading && <div className="photo-gallery">
          <div className="container">
            <div className="intro">

            </div>
            <div className="row photos">
              <ul className="">{
                console.log(YoutubeData)
              }
                {YoutubeData && YoutubeData.map(item => {
                  return <li key={item.id} className="">
                    <a>
                      <h4 className=" py-2">{item.title}</h4>
                    </a>
                    <div className="row border-top pt-2">
                      {item.videos && item.videos.items && item.videos.items.map(({ id, snippet = {} }) => {
                        const { title, thumbnails = {}, resourceId = {} } = snippet;
                        const { medium } = thumbnails;
                        return (
                          <dv key={id} className="col-12 col-md-4 my-1">
                            <a target="_blank" href={`https://www.youtube.com/watch?v=${resourceId.videoId}`}>
                              <p>
                                <img src={medium.url} className="w-100" alt="" />
                              </p>
                              <h6 className="galleryheader">{title}</h6>
                            </a>
                          </dv>
                        )
                      })}
                    </div>

                  </li>
                })}
              </ul>


            </div>
          </div>
        </div>}

      </div>
      {/* Mid Content Ends */}
    </>
  )
}