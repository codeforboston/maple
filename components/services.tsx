const services: React.FC[] = []

export const Services = () => (
  <>
    {services.map((Service, i) => (
      <Service key={i} />
    ))}
  </>
)
