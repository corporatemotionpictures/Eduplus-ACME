import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { fetchAll, updateAdditional } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';


import { getColor } from 'components/featured/functions/colors'

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg rounded-lg p-2 text-xs">
        <div>
          <span className="font-bold">{payload[0].name}:</span>{' '}
          <span className="font-normal">{payload[0].value}</span>
        </div>
      </div>
    )
  }
  return null
}


export const Donut1 = ({ url, query = {} }) => {

  const [data, setData] = useState([])
  const [first, setFirst] = useState(true)


  useEffect(() => {

    if (Object.keys(query).length > 0) {
      setFirst(true)
    }
    return
  }, [query])

  useEffect(() => {

    async function getInnerdata() {

      if (first == true && query != {}) {
        let data = await fetchAll(url, query)

        setData(data.revenues)

      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])


  let colors = [
    getColor('bg-blue-200'),
    getColor('bg-blue-400'),
    getColor('bg-blue-600'),
    getColor('bg-green-200'),
    getColor('bg-green-400'),
    getColor('bg-green-600'),
    getColor('bg-red-200'),
    getColor('bg-red-400'),
    getColor('bg-red-600'),
  ]

  return (
    <div style={{ width: '100%', height: 240 }}>
      {data.length === 0 && <div className="donut"><div className="profilePicIcon2 animateShimmer din  w-40  "></div></div>
        || <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={60} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>}
    </div>
  )
}
