import { Line } from "react-chartjs-2"
import { ChartData, Chart, registerables } from "chart.js"
Chart.register(...registerables)
import { Bill, MemberReference } from "components/db/bills"
import "chartjs-adapter-moment"


const parseResponseDate = (date: string): Date => {
  return new Date(Date.parse(date))
}

export const BillCosponsorCard = ({ bill }: { bill: Bill }) => {
  const sortedCosponsors = bill.content.Cosponsors.sort(
    (a, b) => parseResponseDate(a.ResponseDate).getTime() - parseResponseDate(b.ResponseDate).getTime()
  )
  const labels = sortedCosponsors.map(cs => parseResponseDate(cs.ResponseDate))
  const chartData = labels.map(d => {
    const date = typeof d === "string" ? new Date(d) : d
    const signedOn = sortedCosponsors.filter(
      cs => parseResponseDate(cs.ResponseDate) <= date
    )
    return {
      index: signedOn.length,
      newest: signedOn.pop(),
    }
  })
  const data: ChartData<'line', {index: number, newest: MemberReference | undefined} []> = {
    labels: labels,
    datasets: [{
      label: "Cosponsors",
      data: chartData,
      parsing: {
        xAxisKey: 'newest.ResponseDate',
        yAxisKey: 'index'
      },
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)"
    }]
  }

  return (
    <div>
      <Line
        data={data}
        options={{
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day"
              }
            },
            y: {
              min: 0,
              max: chartData.length + 2,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Cosponsors - ${bill.id}`
            },
            tooltip: {
              enabled: false,
              position: 'nearest',
              external: externalTooltipHandler,
            }
          }
        }}
      />
    </div>
  )
}

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  const tooltipContent = document.createElement('div');
  tooltipContent.setAttribute('id', 'tooltip-content')
  tooltipContent.style.margin = '0px';

  tooltipEl.appendChild(tooltipContent);

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const {chart, tooltip} = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  if (tooltip.body) {

    const tooltipContent = tooltipEl.querySelector('#tooltip-content');
    tooltipContent.style.display = 'flex'
    tooltipContent.style.flexDirection = 'column'
    tooltipContent.style.alignItems = 'center'

    const imageContainer = document.createElement('div')
    imageContainer.style.height = '75px'
    imageContainer.style.width = '75px'
    imageContainer.style.clipPath = 'circle(40%)'

    const image = document.createElement('img')
    const data = tooltip.dataPoints[0]
    const index: number = data.dataIndex
    const item = data.dataset.data[index].newest
    image.style.width = '75px'
    image.style.height = 'auto'
    image.src = `https://malegislature.gov/Legislators/Profile/173/${item.Id}.jpg`

    const label = document.createElement('div')
    label.style.display = 'flex'
    label.style.flexDirection = 'column'
    label.style.textAlign = 'center'
    label.innerHTML = `
      <span>${item.Name}</span>
      <span>Cosponsors: ${data.dataset.data[index].index}</span>
      <span>Date: ${parseResponseDate(item.ResponseDate).toLocaleString()}</span>
    `

    // Remove old children
    while (tooltipContent.firstChild) {
      tooltipContent.firstChild.remove();
    }

    // Add new children
    tooltipContent.appendChild(imageContainer)
    tooltipContent.appendChild(label)
    imageContainer.appendChild(image)

  }

  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  tooltipEl.style.whiteSpace = 'nowrap'
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
};
