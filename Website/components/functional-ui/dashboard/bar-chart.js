import {getColor} from 'components/featured/functions/colors'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
// import {random} from 'components/featured/functions/numbers'

const CustomTooltip = ({active, payload, label}) => {
  if (active) {
    let {name, sales, users} = {...payload[0].payload}
    return (
      <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg rounded-lg p-2 text-xs">
        <div className="font-bold">{name}</div>
        <div>
          <span className="font-bold">Sales:</span>{' '}
          <span className="font-normal">{sales}</span>
        </div>
        <div>
          <span className="font-bold">Users:</span>{' '}
          <span className="font-normal">{users}</span>
        </div>
      </div>
    )
  }
  return null
}

export const Bar1 = ({ graphData }) => {
  let colors = [
    {dataKey: 'sales', fill: getColor('bg-blue-200')},
    {dataKey: 'users', fill: getColor('bg-blue-600')}
  ]
  const labels = Object.keys(graphData)
  const data = Object.keys(graphData).map(i => {
    return {
      name: i,
      sales: graphData[i].order,
      users: graphData[i].user
    }
  })

  return (
    <div style={{width: '100%', height: 240}}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10
          }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/> 
          {colors.map((color, i) => (
            <Bar
              key={i}
              barSize={10}
              //stackId="sales"
              dataKey={color.dataKey}
              fill={color.fill}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

