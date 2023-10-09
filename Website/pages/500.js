import Link from 'next/link'
import define from 'src/json/worddefination.json'

const ErrorPage = () => {
  return (
    <div
      data-layout="centered"
      className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col w-full max-w-xl text-center">
        <img
          className="object-contain w-auto h-100 mb-8"
          src="/images/500.jpg"
          alt={window.localStorage.getItem('defaultImageAlt')}
        />
       
      </div>
    </div>
  )
}

export default ErrorPage
