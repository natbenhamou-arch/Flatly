import { University } from '@/types';

// Comprehensive university directory for autocomplete
export const UNIVERSITIES: University[] = [
  // California
  { id: 'ucb', name: 'University of California, Berkeley', city: 'Berkeley', country: 'United States', domain: 'berkeley.edu', top500: true },
  { id: 'ucla', name: 'University of California, Los Angeles', city: 'Los Angeles', country: 'United States', domain: 'ucla.edu', top500: true },
  { id: 'ucsd', name: 'University of California, San Diego', city: 'San Diego', country: 'United States', domain: 'ucsd.edu', top500: true },
  { id: 'ucsf', name: 'University of California, San Francisco', city: 'San Francisco', country: 'United States', domain: 'ucsf.edu', top500: true },
  { id: 'stanford', name: 'Stanford University', city: 'Stanford', country: 'United States', domain: 'stanford.edu', top500: true },
  { id: 'caltech', name: 'California Institute of Technology', city: 'Pasadena', country: 'United States', domain: 'caltech.edu', top500: true },
  { id: 'usc', name: 'University of Southern California', city: 'Los Angeles', country: 'United States', domain: 'usc.edu', top500: true },
  { id: 'csu-sf', name: 'San Francisco State University', city: 'San Francisco', country: 'United States' },
  { id: 'sjsu', name: 'San Jose State University', city: 'San Jose', country: 'United States' },

  // New York
  { id: 'columbia', name: 'Columbia University', city: 'New York', country: 'United States', domain: 'columbia.edu', top500: true },
  { id: 'nyu', name: 'New York University', city: 'New York', country: 'United States', domain: 'nyu.edu', top500: true },
  { id: 'cornell', name: 'Cornell University', city: 'Ithaca', country: 'United States', domain: 'cornell.edu', top500: true },
  { id: 'cuny', name: 'City University of New York', city: 'New York', country: 'United States' },
  { id: 'fordham', name: 'Fordham University', city: 'New York', country: 'United States', domain: 'fordham.edu' },
  { id: 'pace', name: 'Pace University', city: 'New York', country: 'United States', domain: 'pace.edu' },

  // Massachusetts
  { id: 'harvard', name: 'Harvard University', city: 'Cambridge', country: 'United States', domain: 'harvard.edu', top500: true },
  { id: 'mit', name: 'Massachusetts Institute of Technology', city: 'Cambridge', country: 'United States', domain: 'mit.edu', top500: true },
  { id: 'bu', name: 'Boston University', city: 'Boston', country: 'United States', domain: 'bu.edu', top500: true },
  { id: 'northeastern', name: 'Northeastern University', city: 'Boston', country: 'United States', domain: 'northeastern.edu', top500: true },
  { id: 'tufts', name: 'Tufts University', city: 'Medford', country: 'United States', domain: 'tufts.edu', top500: true },
  { id: 'umass', name: 'University of Massachusetts Amherst', city: 'Amherst', country: 'United States', domain: 'umass.edu', top500: true },

  // Texas
  { id: 'ut-austin', name: 'University of Texas at Austin', city: 'Austin', country: 'United States', domain: 'utexas.edu', top500: true },
  { id: 'rice', name: 'Rice University', city: 'Houston', country: 'United States', domain: 'rice.edu', top500: true },
  { id: 'tamu', name: 'Texas A&M University', city: 'College Station', country: 'United States', domain: 'tamu.edu', top500: true },
  { id: 'smu', name: 'Southern Methodist University', city: 'Dallas', country: 'United States', domain: 'smu.edu' },
  { id: 'ttu', name: 'Texas Tech University', city: 'Lubbock', country: 'United States', domain: 'ttu.edu' },

  // Illinois
  { id: 'uchicago', name: 'University of Chicago', city: 'Chicago', country: 'United States', domain: 'uchicago.edu', top500: true },
  { id: 'northwestern', name: 'Northwestern University', city: 'Evanston', country: 'United States', domain: 'northwestern.edu', top500: true },
  { id: 'uiuc', name: 'University of Illinois Urbana-Champaign', city: 'Urbana', country: 'United States', domain: 'illinois.edu', top500: true },
  { id: 'depaul', name: 'DePaul University', city: 'Chicago', country: 'United States', domain: 'depaul.edu' },
  { id: 'loyola-chicago', name: 'Loyola University Chicago', city: 'Chicago', country: 'United States', domain: 'luc.edu' },

  // Florida
  { id: 'uf', name: 'University of Florida', city: 'Gainesville', country: 'United States', domain: 'ufl.edu', top500: true },
  { id: 'fsu', name: 'Florida State University', city: 'Tallahassee', country: 'United States', domain: 'fsu.edu' },
  { id: 'miami', name: 'University of Miami', city: 'Miami', country: 'United States', domain: 'miami.edu', top500: true },
  { id: 'fiu', name: 'Florida International University', city: 'Miami', country: 'United States', domain: 'fiu.edu' },
  { id: 'ucf', name: 'University of Central Florida', city: 'Orlando', country: 'United States', domain: 'ucf.edu' },

  // Washington
  { id: 'uw', name: 'University of Washington', city: 'Seattle', country: 'United States', domain: 'uw.edu', top500: true },
  { id: 'wsu', name: 'Washington State University', city: 'Pullman', country: 'United States', domain: 'wsu.edu' },
  { id: 'seattle-u', name: 'Seattle University', city: 'Seattle', country: 'United States', domain: 'seattleu.edu' },

  // Pennsylvania
  { id: 'upenn', name: 'University of Pennsylvania', city: 'Philadelphia', country: 'United States', domain: 'upenn.edu', top500: true },
  { id: 'cmu', name: 'Carnegie Mellon University', city: 'Pittsburgh', country: 'United States', domain: 'cmu.edu', top500: true },
  { id: 'psu', name: 'Pennsylvania State University', city: 'University Park', country: 'United States', domain: 'psu.edu', top500: true },
  { id: 'temple', name: 'Temple University', city: 'Philadelphia', country: 'United States', domain: 'temple.edu' },
  { id: 'drexel', name: 'Drexel University', city: 'Philadelphia', country: 'United States', domain: 'drexel.edu' },

  // Georgia
  { id: 'uga', name: 'University of Georgia', city: 'Athens', country: 'United States', domain: 'uga.edu' },
  { id: 'gt', name: 'Georgia Institute of Technology', city: 'Atlanta', country: 'United States', domain: 'gatech.edu', top500: true },
  { id: 'emory', name: 'Emory University', city: 'Atlanta', country: 'United States', domain: 'emory.edu', top500: true },
  { id: 'gsu', name: 'Georgia State University', city: 'Atlanta', country: 'United States', domain: 'gsu.edu' },

  // North Carolina
  { id: 'unc', name: 'University of North Carolina at Chapel Hill', city: 'Chapel Hill', country: 'United States', domain: 'unc.edu', top500: true },
  { id: 'duke', name: 'Duke University', city: 'Durham', country: 'United States', domain: 'duke.edu', top500: true },
  { id: 'ncsu', name: 'North Carolina State University', city: 'Raleigh', country: 'United States', domain: 'ncsu.edu' },
  { id: 'wake-forest', name: 'Wake Forest University', city: 'Winston-Salem', country: 'United States', domain: 'wfu.edu' },

  // Virginia
  { id: 'uva', name: 'University of Virginia', city: 'Charlottesville', country: 'United States', domain: 'virginia.edu', top500: true },
  { id: 'vt', name: 'Virginia Tech', city: 'Blacksburg', country: 'United States', domain: 'vt.edu' },
  { id: 'vcu', name: 'Virginia Commonwealth University', city: 'Richmond', country: 'United States', domain: 'vcu.edu' },

  // Ohio
  { id: 'osu', name: 'Ohio State University', city: 'Columbus', country: 'United States', domain: 'osu.edu', top500: true },
  { id: 'case-western', name: 'Case Western Reserve University', city: 'Cleveland', country: 'United States', domain: 'case.edu', top500: true },
  { id: 'ou', name: 'Ohio University', city: 'Athens', country: 'United States', domain: 'ohio.edu' },

  // Michigan
  { id: 'umich', name: 'University of Michigan', city: 'Ann Arbor', country: 'United States', domain: 'umich.edu', top500: true },
  { id: 'msu', name: 'Michigan State University', city: 'East Lansing', country: 'United States', domain: 'msu.edu' },
  { id: 'wayne-state', name: 'Wayne State University', city: 'Detroit', country: 'United States', domain: 'wayne.edu' },

  // Colorado
  { id: 'cu-boulder', name: 'University of Colorado Boulder', city: 'Boulder', country: 'United States', domain: 'colorado.edu', top500: true },
  { id: 'csu', name: 'Colorado State University', city: 'Fort Collins', country: 'United States', domain: 'colostate.edu' },
  { id: 'du', name: 'University of Denver', city: 'Denver', country: 'United States', domain: 'du.edu' },

  // Arizona
  { id: 'asu', name: 'Arizona State University', city: 'Tempe', country: 'United States', domain: 'asu.edu' },
  { id: 'ua', name: 'University of Arizona', city: 'Tucson', country: 'United States', domain: 'arizona.edu' },

  // Oregon
  { id: 'uo', name: 'University of Oregon', city: 'Eugene', country: 'United States', domain: 'uoregon.edu' },
  { id: 'osu-oregon', name: 'Oregon State University', city: 'Corvallis', country: 'United States', domain: 'oregonstate.edu' },
  { id: 'portland-state', name: 'Portland State University', city: 'Portland', country: 'United States', domain: 'pdx.edu' },

  // Utah
  { id: 'utah', name: 'University of Utah', city: 'Salt Lake City', country: 'United States', domain: 'utah.edu' },
  { id: 'byu', name: 'Brigham Young University', city: 'Provo', country: 'United States', domain: 'byu.edu' },
  { id: 'usu', name: 'Utah State University', city: 'Logan', country: 'United States', domain: 'usu.edu' },

  // Nevada
  { id: 'unlv', name: 'University of Nevada, Las Vegas', city: 'Las Vegas', country: 'United States', domain: 'unlv.edu' },
  { id: 'unr', name: 'University of Nevada, Reno', city: 'Reno', country: 'United States', domain: 'unr.edu' },

  // Canada
  { id: 'toronto', name: 'University of Toronto', city: 'Toronto', country: 'Canada', top500: true },
  { id: 'mcgill', name: 'McGill University', city: 'Montreal', country: 'Canada', top500: true },
  { id: 'ubc', name: 'University of British Columbia', city: 'Vancouver', country: 'Canada', top500: true },

  // United Kingdom (expanded)
  { id: 'oxford', name: 'University of Oxford', city: 'Oxford', country: 'United Kingdom', top500: true },
  { id: 'cambridge', name: 'University of Cambridge', city: 'Cambridge', country: 'United Kingdom', top500: true },
  { id: 'imperial', name: 'Imperial College London', city: 'London', country: 'United Kingdom', top500: true },
  { id: 'ucl', name: 'University College London', city: 'London', country: 'United Kingdom', top500: true },
  { id: 'lse', name: 'London School of Economics and Political Science', city: 'London', country: 'United Kingdom', top500: true },
  { id: 'kcl', name: "King's College London", city: 'London', country: 'United Kingdom', top500: true },
  { id: 'edinburgh', name: 'University of Edinburgh', city: 'Edinburgh', country: 'United Kingdom', top500: true },
  { id: 'manchester', name: 'University of Manchester', city: 'Manchester', country: 'United Kingdom', top500: true },
  { id: 'warwick', name: 'University of Warwick', city: 'Coventry', country: 'United Kingdom', top500: true },
  { id: 'bristol', name: 'University of Bristol', city: 'Bristol', country: 'United Kingdom', top500: true },
  { id: 'durham', name: 'Durham University', city: 'Durham', country: 'United Kingdom', top500: true },
  { id: 'bath', name: 'University of Bath', city: 'Bath', country: 'United Kingdom', top500: true },
  { id: 'st-andrews', name: 'University of St Andrews', city: 'St Andrews', country: 'United Kingdom', top500: true },
  { id: 'glasgow', name: 'University of Glasgow', city: 'Glasgow', country: 'United Kingdom', top500: true },
  { id: 'exeter', name: 'University of Exeter', city: 'Exeter', country: 'United Kingdom', top500: true },
  { id: 'southampton', name: 'University of Southampton', city: 'Southampton', country: 'United Kingdom', top500: true },
  { id: 'leeds', name: 'University of Leeds', city: 'Leeds', country: 'United Kingdom', top500: true },
  { id: 'sheffield', name: 'University of Sheffield', city: 'Sheffield', country: 'United Kingdom', top500: true },
  { id: 'birmingham', name: 'University of Birmingham', city: 'Birmingham', country: 'United Kingdom', top500: true },
  { id: 'nottingham', name: 'University of Nottingham', city: 'Nottingham', country: 'United Kingdom', top500: true },
  { id: 'qmul', name: 'Queen Mary University of London', city: 'London', country: 'United Kingdom', top500: true },
  { id: 'lancaster', name: 'Lancaster University', city: 'Lancaster', country: 'United Kingdom', top500: true },
  { id: 'loughborough', name: 'Loughborough University', city: 'Loughborough', country: 'United Kingdom', top500: true },
  { id: 'york', name: 'University of York', city: 'York', country: 'United Kingdom', top500: true },
  { id: 'newcastle', name: 'Newcastle University', city: 'Newcastle upon Tyne', country: 'United Kingdom', top500: true },
  { id: 'cardiff', name: 'Cardiff University', city: 'Cardiff', country: 'United Kingdom', top500: true },
  { id: 'queens-belfast', name: "Queen's University Belfast", city: 'Belfast', country: 'United Kingdom', top500: true },
  { id: 'liverpool', name: 'University of Liverpool', city: 'Liverpool', country: 'United Kingdom', top500: true },
  { id: 'sussex', name: 'University of Sussex', city: 'Brighton', country: 'United Kingdom', top500: true },
  { id: 'surrey', name: 'University of Surrey', city: 'Guildford', country: 'United Kingdom', top500: true },
  { id: 'leicester', name: 'University of Leicester', city: 'Leicester', country: 'United Kingdom' },
  { id: 'kent', name: 'University of Kent', city: 'Canterbury', country: 'United Kingdom' },
  { id: 'reading', name: 'University of Reading', city: 'Reading', country: 'United Kingdom' },
  { id: 'strathclyde', name: 'University of Strathclyde', city: 'Glasgow', country: 'United Kingdom' },
  { id: 'aberdeen', name: 'University of Aberdeen', city: 'Aberdeen', country: 'United Kingdom' },
  { id: 'soas', name: 'SOAS University of London', city: 'London', country: 'United Kingdom' },
  { id: 'city-london', name: 'City, University of London', city: 'London', country: 'United Kingdom' },
  { id: 'brunel', name: 'Brunel University London', city: 'London', country: 'United Kingdom' },
  { id: 'birkbeck', name: 'Birkbeck, University of London', city: 'London', country: 'United Kingdom' },
  { id: 'westminster', name: 'University of Westminster', city: 'London', country: 'United Kingdom' },
  { id: 'hertfordshire', name: 'University of Hertfordshire', city: 'Hatfield', country: 'United Kingdom' },
  { id: 'uea', name: 'University of East Anglia', city: 'Norwich', country: 'United Kingdom' },
  { id: 'heriot-watt', name: 'Heriot-Watt University', city: 'Edinburgh', country: 'United Kingdom' },
  { id: 'stirling', name: 'University of Stirling', city: 'Stirling', country: 'United Kingdom' },
  { id: 'dundee', name: 'University of Dundee', city: 'Dundee', country: 'United Kingdom' },
  { id: 'aston', name: 'Aston University', city: 'Birmingham', country: 'United Kingdom' },
  { id: 'essex', name: 'University of Essex', city: 'Colchester', country: 'United Kingdom' },
  { id: 'portsmouth', name: 'University of Portsmouth', city: 'Portsmouth', country: 'United Kingdom' },
  { id: 'swansea', name: 'Swansea University', city: 'Swansea', country: 'United Kingdom' },
  { id: 'goldsmiths', name: 'Goldsmiths, University of London', city: 'London', country: 'United Kingdom' },
  { id: 'royal-holloway', name: 'Royal Holloway, University of London', city: 'Egham', country: 'United Kingdom' },
  { id: 'uwe-bristol', name: 'University of the West of England', city: 'Bristol', country: 'United Kingdom' },

  // Australia
  { id: 'melbourne', name: 'University of Melbourne', city: 'Melbourne', country: 'Australia', top500: true },
  { id: 'sydney', name: 'University of Sydney', city: 'Sydney', country: 'Australia', top500: true },
  { id: 'anu', name: 'Australian National University', city: 'Canberra', country: 'Australia', top500: true },
];

// Common neighborhoods by city
export const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'London': [
    'Camden', 'Islington', 'Hackney', 'Shoreditch', 'Notting Hill', 'Kensington', 'Chelsea', 'Clapham', 'Brixton', 'Greenwich', 'Canary Wharf', 'Southwark', 'Hammersmith', 'Fulham', 'Wimbledon'
  ],
  'Paris': [
    'Le Marais', 'Latin Quarter', 'Montmartre', 'Bastille', 'Canal Saint-Martin', 'Belleville', 'Saint-Germain-des-Prés', 'Batignolles', 'Oberkampf', 'Nation'
  ],
  'Berkeley': [
    'North Berkeley', 'South Berkeley', 'West Berkeley', 'Downtown Berkeley',
    'Elmwood', 'Claremont', 'Thousand Oaks', 'Southside'
  ],
  'San Francisco': [
    'Mission', 'Castro', 'SOMA', 'Financial District', 'Nob Hill',
    'Russian Hill', 'Pacific Heights', 'Marina', 'Sunset', 'Richmond'
  ],
  'Los Angeles': [
    'Westwood', 'Santa Monica', 'Venice', 'Beverly Hills', 'Hollywood',
    'Downtown LA', 'Koreatown', 'Silver Lake', 'Echo Park', 'Pasadena'
  ],
  'New York': [
    'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island',
    'East Village', 'West Village', 'SoHo', 'Tribeca', 'Upper East Side'
  ],
  'Boston': [
    'Back Bay', 'North End', 'South End', 'Cambridge', 'Somerville',
    'Beacon Hill', 'Fenway', 'Allston', 'Brighton', 'Jamaica Plain'
  ],
  'Chicago': [
    'Lincoln Park', 'Wicker Park', 'River North', 'Gold Coast',
    'Logan Square', 'Lakeview', 'Old Town', 'Loop', 'Bucktown'
  ],
  'Austin': [
    'Downtown', 'South Austin', 'East Austin', 'West Campus',
    'Hyde Park', 'Zilker', 'Clarksville', 'Tarrytown', 'Mueller'
  ],
  'Seattle': [
    'Capitol Hill', 'Fremont', 'Ballard', 'Queen Anne', 'Wallingford',
    'University District', 'Belltown', 'Georgetown', 'Greenwood'
  ],
  'Miami': [
    'South Beach', 'Brickell', 'Wynwood', 'Design District', 'Coral Gables',
    'Coconut Grove', 'Little Havana', 'Aventura', 'Key Biscayne'
  ],
  'Atlanta': [
    'Midtown', 'Buckhead', 'Virginia-Highland', 'Little Five Points',
    'Inman Park', 'Grant Park', 'Old Fourth Ward', 'Decatur', 'Sandy Springs'
  ]
};

// Search function for universities
export function searchUniversities(query: string, opts?: { top500Only?: boolean }): University[] {
  if (!query || query.length < 2) return [];
  const { top500Only } = opts ?? {};

  const lowercaseQuery = query.toLowerCase();
  // Filter + optional Top-500
  const filtered = UNIVERSITIES.filter(uni => {
    if (top500Only && !uni.top500) return false;
    const inName = uni.name.toLowerCase().includes(lowercaseQuery);
    const inCity = uni.city.toLowerCase().includes(lowercaseQuery);
    const inCountry = uni.country.toLowerCase().includes(lowercaseQuery);
    return inName || inCity || inCountry;
  });

  // De-dupe by name|city|country
  const seen = new Set<string>();
  const deduped: University[] = [];
  for (const u of filtered) {
    const key = `${u.name}|${u.city}|${u.country}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(u);
    }
  }

  // Basic relevance: startsWith > includes
  deduped.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aCity = a.city.toLowerCase();
    const bCity = b.city.toLowerCase();
    const q = lowercaseQuery;
    const score = (name: string, city: string) => (
      (name.startsWith(q) ? 2 : 0) + (city.startsWith(q) ? 1 : 0) + (name.includes(q) ? 0.5 : 0) + (city.includes(q) ? 0.25 : 0)
    );
    return score(bName, bCity) - score(aName, aCity);
  });

  return deduped.slice(0, 10);
}

// Get neighborhoods for a city
export function getNeighborhoods(city: string): string[] {
  return NEIGHBORHOODS_BY_CITY[city] || [];
}

// Find university by name
export function findUniversityByName(name: string): University | null {
  return UNIVERSITIES.find(uni => uni.name === name) || null;
}
