import {getColor} from 'components/featured/functions/colors'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'

const CustomTooltip = ({active, payload, label}) => {
  if (active) {
    let {name, sales, conversions} = {...payload[0].payload}
    return (
      <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg rounded-lg p-2 text-xs">
        <div className="font-bold">{name}</div>
        <div>
          <span className="font-bold">Sales:</span>{' '}
          <span className="font-normal">{sales}</span>
        </div>
        <div>
          <span className="font-bold">Conversions:</span>{' '}
          <span className="font-normal">{conversions}</span>
        </div>
      </div>
    )
  }
  return null
}

export const Line1 = () => {
  let colors = [
    {dataKey: 'sales', stroke: getColor('bg-blue-200')},
    {dataKey: 'conversions', stroke: getColor('bg-blue-400')}
  ]
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const data = Array.from(Array(12).keys()).map(i => {
    return {
      name: labels[i],
      sales: 188,
      conversions: 222
    }
  })

  return (
    <div style={{width: '100%', height: 320}}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10
          }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          {colors.map((color, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={color.dataKey}
              stroke={color.stroke}
              strokeWidth={2}
              activeDot={{r: 8}}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
