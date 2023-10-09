import Document, { Html, Head, Main, NextScript } from 'next/document'
import { getSettings } from 'helpers/apiService';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  state = {
    appData: {}
  }

  componentDidMount() {
  }

  render() {

    return (
      <Html lang="en">
        <Head>
        </Head>
        <body>

          <div id="portal" />
          <Main />

          <script src="/website/assets/js/jquery-3.2.1.min.js"></script>
          <script src="/website/assets/js/popper.min.js"></script>
          <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>

          <script async src="https://www.googletagmanager.com/gtag/js?id=G-EJSPY1D5VC"></script>

          <script src="/website/assets/js/custom.js"></script>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/js/lightbox.min.js"></script>
          <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
          
          <script src="https://ckeditor.com/apps/ckfinder/3.5.0/ckfinder.js"></script>
          <NextScript />

        </body>
      </Html>
    )
  }
}

export default MyDocument
