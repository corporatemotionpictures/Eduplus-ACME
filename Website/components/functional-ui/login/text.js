import config from 'helpers/redux/reducers/config'

const Text = () => {
  const { configValue } = config()
  let { name } = { ...configValue }
  return (
    <div className="flex flex-col w-full">

      {
        process.env.NEXT_PUBLIC_DOMAIN == 'vajrashiksha' &&
        <p className="text-2xl font-bold mb-4 ">
          Welcome to Vajra Shiksha Control Panel
        </p> ||
        <p className="text-2xl font-bold mb-4 ">
          Welcome to EduPlus+ Control Panel
        </p>
      }
      <p className="text-sm text-justify">
        Create your Virtual Coaching Institute and Sell your video lectures all around the globe. We promise to provide strongest digital Infrastructure for all the coaching institutes associated with us.      </p>
    </div>
  )
}
export default Text
