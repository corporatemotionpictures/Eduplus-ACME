import Link from 'next/link'
import config from 'helpers/redux/reducers/config'

const Footer = () => {
  const { configValue } = config()
  let { name } = { ...configValue }
  return (
    <div className="flex flex-row items-center justify-between w-full text-xs z-10">
      <div className="text-white">&copy; {name} {new Date().getFullYear()}</div>
      <div className="flex flex-row ml-auto space-x-2">
        <Link href="https://www.etherealcorporate.com/ethereal-privacy-policy">
          <a target="_blank">Privacy Policy</a>
        </Link>
        <Link href="https://www.etherealcorporate.com/ethereal-terms-of-use">
          <a target="_blank">Terms of Service</a>
        </Link>
        <Link href="https://www.etherealcorporate.com/contact">
          <a target="_blank">Contact us</a>
        </Link>
      </div>
    </div>
  )
}

export default Footer
