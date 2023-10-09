import config from 'helpers/redux/reducers/config'

const Demos = () => {
  const demos = [
    {name: 'demo-1', title: 'Light background'},
    {name: 'demo-2', title: 'Dark background'},
    {name: 'demo-3', title: 'Small sidebar'},
    {name: 'demo-4', title: 'Dark sidebar'},
    {name: 'demo-5', title: 'Dark small sidebar'},
    {name: 'demo-6', title: 'Dark navbar'}
  ]
  

  const setDemo = demo => {
    switch (demo) {
      case 'demo-1':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: false,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'light',
            leftSidebar: 'light',
            navbar: 'light'
          }
        })
        break
      case 'demo-2':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: false,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'dark',
            leftSidebar: 'dark',
            navbar: 'dark'
          }
        })
        break
      case 'demo-3':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: true,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'light',
            leftSidebar: 'light',
            navbar: 'light'
          }
        })
        break
      case 'demo-4':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: false,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'light',
            leftSidebar: 'dark',
            navbar: 'light'
          }
        })
        break
      case 'demo-5':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: true,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'light',
            leftSidebar: 'dark',
            navbar: 'light'
          }
        })
        break
      case 'demo-6':
        config({
          type: 'SET_CONFIG',
          config: {
            layout: 'dashbaord',
            collapsed: false,
            backdrop: false
          }
        })
        config({
          type: 'SET_PALETTE',
          palette: {
            background: 'light',
            leftSidebar: 'light',
            navbar: 'dark'
          }
        })
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col p-4">
      <div className="uppercase text-sm font-bold tracking-wider mb-2">
        Demos
      </div>
      <div className="flex flex-col">
        {demos.map((demo, i) => (
          <button
            key={i}
            className="flex h-8 w-full"
            onClick={() => setDemo(demo.name)}>
            {demo.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Demos
