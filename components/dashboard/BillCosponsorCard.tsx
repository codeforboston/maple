import { Line } from "react-chartjs-2"
import { ChartData, Chart, registerables } from "chart.js"
Chart.register(...registerables);
import { Bill } from "components/db/bills"
import 'chartjs-adapter-moment';

export const BillCosponsorCard = ({bill}: {bill: Bill}) => {
    const precision: string = 'exact'
    const cosponsors = bill.content.Cosponsors
    const labels = cosponsors.map(cs => new Date(Date.parse(cs.ResponseDate))).sort((a, b) => a.getTime() - b.getTime())
    let finalLabels
    if (precision === 'day') {
        finalLabels = Array.from(new Set(labels.map(d => d.toLocaleDateString())))
    } else {
        finalLabels = labels
    }
    const chartData = finalLabels.map(d => {
        const date = typeof d === 'string' ? new Date(d) : d
        return cosponsors.filter(cs => new Date(Date.parse(cs.ResponseDate)) <= date).length
    })
    const data: ChartData<"line"> = {
        labels: finalLabels,
        datasets: [
            {
                label: 'Cosponsors',
                data: chartData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
        ],
    }
    return <div>
        <Line
            data={data}
            options={
                {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                        y: {
                            min: Math.min(...chartData),
                            max: Math.max(...chartData) + 2,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
        } />
    </div>
}
