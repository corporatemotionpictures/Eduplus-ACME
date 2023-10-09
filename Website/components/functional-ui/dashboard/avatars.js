import define from 'src/json/worddefination.json'

const Avatars = ({items}) => {
  return (
    <div className="flex flex-row items-center justify-start">
      {items.map((item, j) => (
        <img
          key={j}
          src={item}
          alt={window.localStorage.getItem('defaultImageAlt')}
          className={`h-8 w-8 ring rounded-full -ml-3`}
        />
      ))}
    </div>
  )
}

export default Avatars
