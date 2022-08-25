/*
Return an object in format below: 
{ day: "Thursday", month: "Aug", year: "2022", date: "18", time: "11:00 AM" }
*/
export const formatDate = (
  dateString: string
): { day: string; month: string; year: string; date: string; time: string } => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]
  const date = new Date(dateString)
  const day = daysOfWeek[new Date(date).getDay()]
  const month = months[date.getMonth()]
  const num = date.getDate().toString()
  const year = date.getFullYear().toString()

  const [hourString, minute] = dateString.split("T")[1].split(":")
  let hour = parseInt(hourString)
  const meridian = hour < 12 ? "AM" : "PM"
  if (hour > 12) hour -= 12
  const formattedTime = `${hour.toString()}:${minute} ${meridian}`

  return { day, month, year, date: num, time: formattedTime }
}

export const numberToFullMonth = (month: number): string => {
  switch (month) {
    case 0:
      return "January"
    case 1:
      return "February"
    case 2:
      return "March"
    case 3:
      return "April"
    case 4:
      return "May"
    case 5:
      return "June"
    case 6:
      return "July"
    case 7:
      return "August"
    case 8:
      return "September"
    case 9:
      return "October"
    case 10:
      return "November"
    case 11:
      return "December"
    default:
      return "August"
  }
}
