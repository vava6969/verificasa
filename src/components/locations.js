// Location data: cities and their zones/neighborhoods for RO and UK
export const LOCATIONS = {
  RO: [
    { city: "București", zones: ["Aviatorilor", "Dorobanți", "Pipera", "Floreasca", "Primăverii", "Herăstrău", "Băneasa", "Centru Vechi", "Obor", "Iancului", "Timpuri Noi", "Titan", "Pantelimon", "Colentina", "Militari", "Drumul Taberei", "Crângași", "Rahova", "Berceni", "Văcărești"] },
    { city: "Cluj-Napoca", zones: ["Centru", "Grigorescu", "Mănăștur", "Zorilor", "Gheorgheni", "Mărăști", "Andrei Mureșanu", "Bună Ziua", "Sopor", "Borhanci"] },
    { city: "Iași", zones: ["Copou", "Târgu Cuța", "Nicolae", "Păcurari", "Podu Roșu", "Alexandru", "Târgu Moșilor", "Galata", "Dacia"] },
    { city: "Timișoara", zones: ["Cetate", "Fabric", "Iosefin", "Elisabetin", "Mehala", "Fratelia", "Lipova", "Freidorf"] },
    { city: "Brașov", zones: ["Centru", "Schei", "Bartolomeu", "Astra", "Craiter", "Valea Cetatii", "Bucium"] },
    { city: "Constanța", zones: ["Centru", "Tomis", "Mamaia", "Făget", "Palas", "Sării", "Burileanu"] },
    { city: "Sibiu", zones: ["Centru Istoric", "Piața Mare", "Sub Arini", "Vest", "Valea Aurie", "Șibenceni"] },
    { city: "Oradea", zones: ["Centru", "Nufărul", "Rogerius", "Ioșia", "Velența"] },
  ],
  UK: [
    { city: "London", zones: ["Shoreditch", "Camden", "Canary Wharf", "Notting Hill", "Kensington", "Islington", "Hackney", "Greenwich", "Brixton", "Clapham", "Wandsworth", "Chelsea", "Soho", "Westminster", "Stratford", "Battersea", "Hammersmith", "Fulham"] },
    { city: "Manchester", zones: ["Northern Quarter", "Salford", "Didsbury", "Chorlton", "Withington", "Spinningfields", "Castlefield", "Ancoats", "Hulme"] },
    { city: "Birmingham", zones: ["Jewellery Quarter", "Digbeth", "Brindleyplace", "Edgbaston", "Moseley", "Harborne", "City Centre"] },
    { city: "Leeds", zones: ["City Centre", "Headingley", "Hyde Park", "Chapel Allerton", "Roundhay", "Horsforth"] },
    { city: "Liverpool", zones: ["Baltic Triangle", "Georgian Quarter", "Anfield", "Wavertree", "Aigburth", "City Centre"] },
    { city: "Edinburgh", zones: ["Old Town", "New Town", "Leith", "Marchmont", "Bruntsfield", "Stockbridge", "Haymarket"] },
    { city: "Bristol", zones: ["Clifton", "Stokes Croft", "Bedminster", "Southville", "Redland", "Cotham", "Hotwells"] },
    { city: "Glasgow", zones: ["West End", "Merchant City", "Finnieston", "Dennistoun", "Shawlands", "Hillhead"] },
    { city: "Brighton", zones: ["Kemptown", "Hanover", "Preston Park", "Hove", "Seven Dials", "Marina"] },
    { city: "Cardiff", zones: ["Pontcanna", "Roath", "Cathays", "Riverside", "Bay", "City Centre"] },
  ],
};

export function getCities(country) {
  return (LOCATIONS[country] || []).map((c) => c.city);
}

export function getZones(country, city) {
  const found = (LOCATIONS[country] || []).find((c) => c.city === city);
  return found ? found.zones : [];
}