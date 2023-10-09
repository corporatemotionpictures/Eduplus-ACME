
import Head from 'next/head';


const Centered = ({ children }) => (

  <>
    <Head>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />

      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous" />

      <link rel="stylesheet" href="/website/assets/css/font-awesome.min.css" />

      <link rel="stylesheet" href="/website/assets/css/zoomstyle.css" />
    </Head>
    <div
      data-layout="centered"
      className="w-full h-screen flex items-center justify-center bg-gray-50">

      {children}
    </div>
  </>


)

export default Centered
