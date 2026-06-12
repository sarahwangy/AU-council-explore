import { prisma } from '../lib/prisma'

const LIBRARIES: Record<string, { name: string; url?: string; address?: string; suburb?: string; phone?: string }[]> = {
  'banyule': [
    { name: 'Ivanhoe Library', url: 'https://www.yprl.vic.gov.au/locations/ivanhoe-library/', address: '275 Upper Heidelberg Road', suburb: 'Ivanhoe', phone: '(03) 9490 8700' },
    { name: 'Rosanna Library', url: 'https://www.yprl.vic.gov.au/locations/rosanna-library/', address: '53 Wetherby Road', suburb: 'Rosanna', phone: '(03) 9490 8700' },
    { name: 'Watsonia Library', url: 'https://www.yprl.vic.gov.au/locations/watsonia-library/', address: '1/186 Morwell Street', suburb: 'Watsonia', phone: '(03) 9490 8700' },
  ],
  'nillumbik': [
    { name: 'Diamond Valley Library', url: 'https://www.yprl.vic.gov.au/locations/diamond-valley-library/', address: '1 Market Place', suburb: 'Greensborough', phone: '(03) 9490 8700' },
    { name: 'Eltham Library', url: 'https://www.yprl.vic.gov.au/locations/eltham-library/', address: 'Cnr Arthur Street & Panther Place', suburb: 'Eltham', phone: '(03) 9490 8700' },
  ],
  'whittlesea': [
    { name: 'Lalor Library', url: 'https://www.yprl.vic.gov.au/locations/lalor-library/', address: '5 David Street', suburb: 'Lalor', phone: '(03) 9490 8700' },
    { name: 'Mernda Library', url: 'https://www.yprl.vic.gov.au/locations/mernda-library/', address: '20 Mernda Village Drive', suburb: 'Mernda', phone: '(03) 9490 8700' },
    { name: 'Mill Park Library', url: 'https://www.yprl.vic.gov.au/locations/mill-park-library/', address: 'Civic Drive', suburb: 'Mill Park', phone: '(03) 9490 8700' },
    { name: 'Murnong Library', url: 'https://www.yprl.vic.gov.au/locations/murnong-library/', address: '24 Meridian Drive', suburb: 'Wollert', phone: '(03) 9490 8700' },
    { name: 'Thomastown Library', url: 'https://www.yprl.vic.gov.au/locations/thomastown-library/', address: 'HC Croft Reserve, Dole Avenue', suburb: 'Thomastown', phone: '(03) 9490 8700' },
    { name: 'Whittlesea Library', url: 'https://www.yprl.vic.gov.au/locations/whittlesea-library/', address: '17-27 Laurimar Town Centre Drive', suburb: 'Doreen', phone: '(03) 9490 8700' },
  ],
  'boroondara': [
    { name: 'Ashburton Library', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/ashburton-library-hours-and-location', address: '154 High Street', suburb: 'Ashburton', phone: '(03) 9810 4500' },
    { name: 'Balwyn Library', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/balwyn-library-hours-and-location', address: '336 Whitehorse Road', suburb: 'Balwyn', phone: '(03) 9810 4500' },
    { name: 'Camberwell Library', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/camberwell-library-hours-and-location', address: '340 Camberwell Road', suburb: 'Camberwell', phone: '(03) 9810 4500' },
    { name: 'Greythorn Library Lounge', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/greythorn-library-lounge-hours-and-location', address: '13 Foote Street', suburb: 'Balwyn North', phone: '(03) 9810 4500' },
    { name: 'Hawthorn Library', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/hawthorn-library-hours-and-location', address: '380 Burwood Road', suburb: 'Hawthorn', phone: '(03) 9810 4500' },
    { name: 'Kew Library', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/kew-library-hours-and-location', address: '166 Cotham Road', suburb: 'Kew', phone: '(03) 9810 4500' },
    { name: 'Hawthorn Arts Centre Library Lounge', url: 'https://www.boroondara.vic.gov.au/services/libraries-boroondara/visit-library/hawthorn-arts-centre-library-lounge-hours-and-location', address: '360 Burwood Road', suburb: 'Hawthorn', phone: '(03) 9810 4500' },
  ],
  'glen-eira': [
    { name: 'Bentleigh Library', url: 'https://library.gleneira.vic.gov.au/about-us/locations-and-hours/bentleigh-library-and-youth-hub', address: '161 Jasper Road', suburb: 'Bentleigh', phone: '(03) 9524 3700' },
    { name: 'Carnegie Library', url: 'https://library.gleneira.vic.gov.au/about-us/locations-and-hours/carnegie-library-and-community-centre', address: '7 Shepparson Avenue', suburb: 'Carnegie', phone: '(03) 9524 3700' },
    { name: 'Caulfield Library', url: 'https://library.gleneira.vic.gov.au/about-us/locations-and-hours/caulfield-library', address: 'Cnr Glen Eira & Hawthorn Roads', suburb: 'Caulfield', phone: '(03) 9524 3700' },
    { name: 'Elsternwick Library', url: 'https://library.gleneira.vic.gov.au/about-us/locations-and-hours/elsternwick-library', address: '4 Staniland Grove', suburb: 'Elsternwick', phone: '(03) 9524 3700' },
  ],
  'port-phillip': [
    { name: 'Albert Park Library', url: 'https://library.portphillip.vic.gov.au/about-our-libraries/library-hours-and-locations/albert-park-library/', address: '66 Bridport Street', suburb: 'Albert Park', phone: '(03) 9209 6780' },
    { name: 'Emerald Hill Library', url: 'https://library.portphillip.vic.gov.au/about-our-libraries/library-hours-and-locations/emerald-hill-library-and-port-phillip-heritage-centre/', address: '1 Ferrars Place', suburb: 'South Melbourne', phone: '(03) 9209 6780' },
    { name: 'Middle Park Library', url: 'https://library.portphillip.vic.gov.au/about-our-libraries/library-hours-and-locations/middle-park-library/', address: 'Cnr Richardson & Armstrong Streets', suburb: 'Middle Park', phone: '(03) 9209 6780' },
    { name: 'Port Melbourne Library', url: 'https://library.portphillip.vic.gov.au/about-our-libraries/library-hours-and-locations/port-melbourne-library/', address: '333 Bay Street', suburb: 'Port Melbourne', phone: '(03) 9209 6780' },
    { name: 'St Kilda Library', url: 'https://library.portphillip.vic.gov.au/about-our-libraries/library-hours-and-locations/st-kilda-library/', address: '150 Carlisle Street', suburb: 'St Kilda', phone: '(03) 9209 6780' },
  ],
  'frankston': [
    { name: 'Frankston Library', url: 'https://library.frankston.vic.gov.au/At-Our-Locations/Branches-Outreach-and-Hours/Frankston-Library', address: '60 Playne Street', suburb: 'Frankston', phone: '(03) 9784 1020' },
    { name: 'Carrum Downs Library', url: 'https://library.frankston.vic.gov.au/At-Our-Locations/Branches-Outreach-and-Hours/Carrum-Downs-Library', address: 'Wedge Road & Hall Road', suburb: 'Carrum Downs', phone: '(03) 9784 1020' },
    { name: 'Seaford Library', url: 'https://library.frankston.vic.gov.au/At-Our-Locations/Branches-Outreach-and-Hours/Seaford-Library', address: '1 Broughton Street', suburb: 'Seaford', phone: '(03) 9784 1020' },
  ],
  'hobsons-bay': [
    { name: 'Altona Library', url: 'https://libraries.hobsonsbay.vic.gov.au/Your-library/Visit/Locations-and-hours/Altona-Library', address: 'Cnr Pier Street & The Strand', suburb: 'Altona', phone: '(03) 9932 1000' },
    { name: 'Altona Meadows Library', url: 'https://libraries.hobsonsbay.vic.gov.au/Your-library/Visit/Locations-and-hours/Altona-Meadows-Library-and-Learning-Centre', address: '1 Newborough Street', suburb: 'Altona Meadows', phone: '(03) 9932 1000' },
    { name: 'Altona North Community Library', url: 'https://libraries.hobsonsbay.vic.gov.au/Your-library/Visit/Locations-and-hours/Altona-North-Community-Library', address: '86 McArthurs Road', suburb: 'Altona North', phone: '(03) 9932 1000' },
    { name: 'Williamstown Library', url: 'https://libraries.hobsonsbay.vic.gov.au/Your-library/Visit/Locations-and-hours/Williamstown-Library', address: '104 Ferguson Street', suburb: 'Williamstown', phone: '(03) 9932 1000' },
  ],
  'darebin': [
    { name: 'Fairfield Library', url: 'https://libraries.darebin.vic.gov.au/Your-library/Visit/Locations-and-hours/Fairfield-Library', address: '21 Station Street', suburb: 'Fairfield', phone: '(03) 8470 8888' },
    { name: 'Northcote Library', url: 'https://libraries.darebin.vic.gov.au/Your-library/Visit/Locations-and-hours/Northcote-Library', address: '32 Separation Street', suburb: 'Northcote', phone: '(03) 8470 8888' },
    { name: 'Preston Library', url: 'https://libraries.darebin.vic.gov.au/Your-library/Visit/Locations-and-hours/Preston-Library', address: '687 High Street', suburb: 'Preston', phone: '(03) 8470 8888' },
    { name: 'Reservoir Library', url: 'https://libraries.darebin.vic.gov.au/Your-library/Visit/Locations-and-hours/Reservoir-Library', address: '3 The Centreway', suburb: 'Reservoir', phone: '(03) 8470 8888' },
  ],
  'greater-dandenong': [
    { name: 'Dandenong Library', url: 'https://libraries.greaterdandenong.vic.gov.au/Our-Library/Visit-Us/Dandenong-Library', address: '225 Lonsdale Street', suburb: 'Dandenong', phone: '(03) 8571 1000' },
    { name: 'Springvale Library', url: 'https://libraries.greaterdandenong.vic.gov.au/Our-Library/Visit-Us/Springvale-Library', address: '5 Hillside Avenue', suburb: 'Springvale', phone: '(03) 8571 1000' },
    { name: 'Keysborough Learning Centre', url: 'https://libraries.greaterdandenong.vic.gov.au/Our-Library/Visit-Us/Keysborough-Learning-and-Community-Centre', address: '1–7 Chapel Road', suburb: 'Keysborough', phone: '(03) 8571 1000' },
  ],
  'mornington-peninsula': [
    { name: 'Hastings Library', url: 'https://library.mornpen.vic.gov.au/About-Us/Opening-Hours-and-Locations/Hastings-Library', address: '1–3 High Street', suburb: 'Hastings', phone: '(03) 5979 7800' },
    { name: 'Mornington Library', url: 'https://library.mornpen.vic.gov.au/About-Us/Opening-Hours-and-Locations/Mornington-Library', address: 'Cnr Barkly & Dunns Streets', suburb: 'Mornington', phone: '(03) 5979 7800' },
    { name: 'Rosebud Library', url: 'https://library.mornpen.vic.gov.au/About-Us/Opening-Hours-and-Locations/Rosebud-Library', address: '54 Peninsula Kingsway', suburb: 'Rosebud', phone: '(03) 5979 7800' },
    { name: 'Somerville Library', url: 'https://library.mornpen.vic.gov.au/About-Us/Opening-Hours-and-Locations/Somerville-Library', address: '16 Eumeralla Road', suburb: 'Somerville', phone: '(03) 5979 7800' },
  ],
  'melbourne': [
    { name: 'City Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '253 Flinders Lane', suburb: 'Melbourne', phone: '(03) 9658 9500' },
    { name: 'Kathleen Syme Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '251 Faraday Street', suburb: 'Carlton', phone: '1800 695 427' },
    { name: 'Library at The Dock', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '107 Victoria Harbour Promenade', suburb: 'Docklands', phone: '1800 695 427' },
    { name: 'East Melbourne Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '122 George Street', suburb: 'East Melbourne', phone: '(03) 9658 9600' },
    { name: 'North Melbourne Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '66 Errol Street', suburb: 'North Melbourne', phone: '(03) 9658 9700' },
    { name: 'Southbank Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '207 City Road', suburb: 'Southbank', phone: '(03) 9658 8300' },
    { name: 'Narrm Ngarrgu Library', url: 'https://www.melbourne.vic.gov.au/community/libraries', address: '141 Therry Street', suburb: 'Melbourne', phone: '1800 695 427' },
  ],
  'stonnington': [
    { name: 'Prahran Square Library', url: 'https://www.stonnington.vic.gov.au/Library/Visit-us', address: '180 Greville Street', suburb: 'Prahran', phone: '(03) 8290 3344' },
    { name: 'Malvern Library', url: 'https://www.stonnington.vic.gov.au/Library/Visit-us/Malvern-Library', address: '1255 High Street', suburb: 'Malvern', phone: '(03) 8290 1366' },
    { name: 'Toorak/South Yarra Library', url: 'https://www.stonnington.vic.gov.au/Library/Visit-us/ToorakSouth-Yarra-Library', address: '340 Toorak Road', suburb: 'South Yarra', phone: '(03) 8290 8000' },
    { name: 'Phoenix Park Library', url: 'https://www.stonnington.vic.gov.au/Library/Visit-us/Phoenix-Park-Library', address: '30 Rob Roy Road', suburb: 'Malvern East', phone: '(03) 8290 4000' },
  ],
  'yarra': [
    { name: 'Carlton Library', url: 'https://www.yarracity.vic.gov.au/our-libraries/hours-and-locations/carlton-library', address: '667 Rathdowne Street', suburb: 'Carlton North', phone: '1300 695 427' },
    { name: 'Collingwood Library', url: 'https://www.yarracity.vic.gov.au/our-libraries/hours-and-locations/collingwood-library', address: '11 Stanton Street', suburb: 'Abbotsford', phone: '1300 695 427' },
    { name: 'Fitzroy Library', url: 'https://www.yarracity.vic.gov.au/our-libraries/hours-and-locations/fitzroy-library', address: '128 Moor Street', suburb: 'Fitzroy', phone: '1300 695 427' },
    { name: 'Bargoonga Nganjin North Fitzroy Library', url: 'https://www.yarracity.vic.gov.au/our-libraries/hours-and-locations/bargoonga-nganjin-north-fitzroy-library', address: '182 St Georges Road', suburb: 'Fitzroy North', phone: '1300 695 427' },
    { name: 'Richmond Library', url: 'https://www.yarracity.vic.gov.au/our-libraries/hours-and-locations/richmond-library', address: '415 Church Street', suburb: 'Richmond', phone: '1300 695 427' },
  ],
  'manningham': [
    { name: 'Bulleen Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Bulleen-Library', address: '109 Manningham Road', suburb: 'Bulleen', phone: '(03) 9896 8450' },
    { name: 'Doncaster Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Doncaster-Library', address: '687 Doncaster Road', suburb: 'Doncaster', phone: '(03) 9877 8500' },
    { name: 'The Pines Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/The-Pines-Library', address: 'Cnr Reynolds Road & Blackburn Road East', suburb: 'Doncaster East', phone: '(03) 9877 8550' },
    { name: 'Warrandyte Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Warrandyte-Library', address: '168 Yarra Street', suburb: 'Warrandyte', phone: '(03) 9895 4250' },
  ],
  'whitehorse': [
    { name: 'Blackburn Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Blackburn-Library', address: 'Cnr Blackburn Road & Central Road', suburb: 'Blackburn', phone: '(03) 9896 8400' },
    { name: 'Box Hill Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Box-Hill-Library', address: '1040 Whitehorse Road', suburb: 'Box Hill', phone: '(03) 9896 4300' },
    { name: 'Nunawading Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Nunawading-Library', address: '379 Whitehorse Road', suburb: 'Nunawading', phone: '(03) 9872 8600' },
    { name: 'Vermont South Library', url: 'https://www.wml.vic.gov.au/Libraries-Hours/Vermont-South-Library', address: 'Pavey Place', suburb: 'Vermont South', phone: '(03) 9872 8650' },
  ],
  'maroondah': [
    { name: 'Croydon Library', url: 'https://www.yourlibrary.vic.gov.au/locations/croydon-library/', address: '5 Civic Square', suburb: 'Croydon', phone: '(03) 9800 6478' },
    { name: 'Realm Library', url: 'https://www.yourlibrary.vic.gov.au/locations/realm-library/', address: '179 Maroondah Highway', suburb: 'Ringwood', phone: '(03) 9800 6430' },
  ],
  'knox': [
    { name: 'Bayswater Library', url: 'https://www.yourlibrary.vic.gov.au/locations/bayswater-library/', address: 'Shop 43, 7–13 High Street', suburb: 'Bayswater', phone: '(03) 9800 6467' },
    { name: 'Boronia Library', url: 'https://www.yourlibrary.vic.gov.au/locations/boronia-library/', address: 'Park Crescent', suburb: 'Boronia', phone: '(03) 9800 6420' },
    { name: 'Ferntree Gully Library', url: 'https://www.yourlibrary.vic.gov.au/locations/ferntree-gully-library/', address: '1010 Burwood Highway', suburb: 'Ferntree Gully', phone: '(03) 9800 6450' },
    { name: 'Knox Library – Ngarrgoo', url: 'https://www.yourlibrary.vic.gov.au/locations/', address: 'Level 3, Westfield Knox, 425 Burwood Highway', suburb: 'Wantirna South', phone: '(03) 9800 6410' },
    { name: 'Rowville Library', url: 'https://www.yourlibrary.vic.gov.au/locations/rowville-library/', address: 'Stud Park Shopping Centre, Stud Road', suburb: 'Rowville', phone: '(03) 9800 6443' },
  ],
  'yarra-ranges': [
    { name: 'Belgrave Library', url: 'https://www.yourlibrary.vic.gov.au/locations/belgrave-library/', address: 'Reynolds Lane', suburb: 'Belgrave', phone: '(03) 9800 6489' },
    { name: 'Healesville Library', url: 'https://www.yourlibrary.vic.gov.au/locations/healesville-library/', address: '110 River Street', suburb: 'Healesville', phone: '(03) 9800 6497' },
    { name: 'Lilydale Library', url: 'https://www.yourlibrary.vic.gov.au/locations/lilydale-library/', address: 'Building LA, Jarlo Drive', suburb: 'Lilydale', phone: '(03) 9800 6460' },
    { name: 'Montrose Library', url: 'https://www.yourlibrary.vic.gov.au/locations/montrose-library/', address: '935 Mount Dandenong Tourist Road', suburb: 'Montrose', phone: '(03) 9800 6490' },
    { name: 'Mooroolbark Library', url: 'https://www.yourlibrary.vic.gov.au/locations/mooroolbark-library/', address: '7 Station Street', suburb: 'Mooroolbark', phone: '(03) 9800 6480' },
    { name: 'Yarra Junction Library', url: 'https://www.yourlibrary.vic.gov.au/locations/yarra-junction-library/', address: '1A Hoddle Street', suburb: 'Yarra Junction', phone: '(03) 9800 6462' },
  ],
  'monash': [
    { name: 'Clayton Library', url: 'https://www.monlib.vic.gov.au/Branches/Clayton-Library', address: '9–15 Cooke Street', suburb: 'Clayton', phone: '(03) 9541 3120' },
    { name: 'Glen Waverley Library', url: 'https://www.monlib.vic.gov.au/Branches', address: '112 Kingsway', suburb: 'Glen Waverley', phone: '(03) 9560 1655' },
    { name: 'Mount Waverley Library', url: 'https://www.monlib.vic.gov.au/Branches', address: '41 Miller Crescent', suburb: 'Mount Waverley', phone: '(03) 9807 5022' },
    { name: 'Mulgrave Library', url: 'https://www.monlib.vic.gov.au/Branches', address: '36–42 Mackie Street', suburb: 'Mulgrave', phone: '(03) 9560 1740' },
    { name: 'Oakleigh Library', url: 'https://www.monlib.vic.gov.au/Branches', address: '148 Drummond Street', suburb: 'Oakleigh', phone: '(03) 9563 9555' },
    { name: 'Wheelers Hill Library', url: 'https://www.monlib.vic.gov.au/Branches', address: '860 Ferntree Gully Road', suburb: 'Wheelers Hill', phone: '(03) 9561 5577' },
  ],
  'bayside': [
    { name: 'Beaumaris Library', url: 'https://www.bayside.vic.gov.au/services/libraries/library-locations-and-opening-hours', address: '96 Reserve Road', suburb: 'Beaumaris', phone: '(03) 9261 7125' },
    { name: 'Brighton Library', url: 'https://www.bayside.vic.gov.au/services/libraries/library-locations-and-opening-hours', address: '14 Wilson Street', suburb: 'Brighton', phone: '(03) 9261 7125' },
    { name: 'Hampton Library', url: 'https://www.bayside.vic.gov.au/services/libraries/library-locations-and-opening-hours', address: '1D Service Street', suburb: 'Hampton', phone: '(03) 9261 7125' },
    { name: 'Sandringham Library', url: 'https://www.bayside.vic.gov.au/services/libraries/library-locations-and-opening-hours', address: '8 Waltham Street', suburb: 'Sandringham', phone: '(03) 9261 7125' },
  ],
  'kingston': [
    { name: 'Chelsea Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/chelsea-library', address: '1 Chelsea Road', suburb: 'Chelsea', phone: '1300 135 668' },
    { name: 'Cheltenham Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/cheltenham-library', address: '12/18 Stanley Avenue', suburb: 'Cheltenham', phone: '1300 135 668' },
    { name: 'Clarinda Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/clarinda-library', address: '58 Viney Street', suburb: 'Clarinda', phone: '1300 135 668' },
    { name: 'Dingley Village Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/dingley-village-library', address: '31C Marcus Road', suburb: 'Dingley Village', phone: '1300 135 668' },
    { name: 'Highett Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/highett-library', address: '310 Highett Road', suburb: 'Highett', phone: '1300 135 668' },
    { name: 'Parkdale Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/parkdale-library', address: '96 Parkers Road', suburb: 'Parkdale', phone: '1300 135 668' },
    { name: 'Patterson Lakes Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/patterson-lakes-library', address: '54 Thompson Road', suburb: 'Patterson Lakes', phone: '1300 135 668' },
    { name: 'Westall Library', url: 'https://library.kingston.vic.gov.au/about-us/locations-and-hours/westall-library', address: '35 Fairbank Road', suburb: 'Clayton South', phone: '1300 135 668' },
  ],
  'merri-bek': [
    { name: 'Brunswick Library', url: 'https://www.merri-bek.vic.gov.au/libraries/', address: 'Cnr Sydney Road & Dawson Street', suburb: 'Brunswick', phone: '(03) 9389 8600' },
    { name: 'Campbell Turnbull Library', url: 'https://www.merri-bek.vic.gov.au/libraries/', address: '220 Melville Road', suburb: 'Brunswick West', phone: '(03) 9384 9200' },
    { name: 'Coburg Library', url: 'https://www.merri-bek.vic.gov.au/libraries/', address: 'Cnr Victoria Street & Louisa Street', suburb: 'Coburg', phone: '(03) 9353 4000' },
    { name: 'Fawkner Library', url: 'https://www.merri-bek.vic.gov.au/libraries/', address: '77 Jukes Road', suburb: 'Fawkner', phone: '(03) 9355 4200' },
    { name: 'Glenroy Library', url: 'https://www.merri-bek.vic.gov.au/libraries/', address: '50 Wheatsheaf Road', suburb: 'Glenroy', phone: '(03) 8311 4100' },
  ],
  'hume': [
    { name: 'Broadmeadows Library', url: 'https://www.humelibraries.vic.gov.au/About-Us/Locations-and-Opening-Hours/Broadmeadows-Library', address: '1093 Pascoe Vale Road', suburb: 'Broadmeadows', phone: '(03) 9356 6900' },
    { name: 'Craigieburn Library', url: 'https://www.humelibraries.vic.gov.au/About-Us/Locations-and-Opening-Hours/Craigieburn-Library', address: '75–95 Central Park Avenue', suburb: 'Craigieburn', phone: '(03) 9356 6980' },
    { name: 'Gladstone Park Community Library', url: 'https://www.humelibraries.vic.gov.au/About-Us/Locations-and-Opening-Hours/Gladstone-Park-Community-Library', address: '40 Taylor Drive', suburb: 'Gladstone Park', phone: '(03) 9356 6990' },
    { name: 'Sunbury Library', url: 'https://www.humelibraries.vic.gov.au/About-Us/Locations-and-Opening-Hours/Sunbury-Library', address: '44 Macedon Street', suburb: 'Sunbury', phone: '(03) 9356 6970' },
    { name: 'Tullamarine Library', url: 'https://www.humelibraries.vic.gov.au/About-Us/Locations-and-Opening-Hours/Tullamarine-Library', address: '58 Spring Street', suburb: 'Tullamarine', phone: '(03) 9356 6960' },
  ],
  'brimbank': [
    { name: 'Deer Park Library', url: 'https://brimbanklibraries.vic.gov.au/visit-us/locations/', address: '4 Neale Road', suburb: 'Deer Park', phone: '(03) 9249 4660' },
    { name: 'Keilor Library', url: 'https://brimbanklibraries.vic.gov.au/visit-us/locations/', address: '704B Old Calder Highway', suburb: 'Keilor', phone: '(03) 9249 4670' },
    { name: 'St Albans Library', url: 'https://brimbanklibraries.vic.gov.au/visit-us/locations/stalbans-library/', address: '71A Alfrieda Street', suburb: 'St Albans', phone: '(03) 9249 4650' },
    { name: 'Sunshine Library', url: 'https://brimbanklibraries.vic.gov.au/visit-us/locations/sunshine-library/', address: '301 Hampshire Road', suburb: 'Sunshine', phone: '(03) 9249 4640' },
    { name: 'Sydenham Library', url: 'https://brimbanklibraries.vic.gov.au/visit-us/locations/', address: '1 Station Street, Watergardens Town Centre', suburb: 'Taylors Lakes', phone: '(03) 9249 4680' },
  ],
  'maribyrnong': [
    { name: 'Braybrook Library', url: 'https://www.maribyrnong.vic.gov.au/library/Visit/Locations-and-Hours/Braybrook-Library', address: '107–109 Churchill Avenue', suburb: 'Braybrook', phone: '(03) 9188 5850' },
    { name: 'Footscray Library', url: 'https://www.maribyrnong.vic.gov.au/library/Visit/Locations-and-Hours/Footscray-Library', address: '56 Paisley Street', suburb: 'Footscray', phone: '(03) 9688 0290' },
    { name: 'Maribyrnong Library', url: 'https://www.maribyrnong.vic.gov.au/library/Visit/Locations-and-Hours/Maribyrnong-Library', address: '200 Rosamond Road', suburb: 'Maribyrnong', phone: '(03) 9688 0231' },
    { name: 'West Footscray Library', url: 'https://www.maribyrnong.vic.gov.au/library/Visit/Locations-and-Hours/West-Footscray-Library', address: '539 Barkly Street', suburb: 'West Footscray', phone: '(03) 9688 0292' },
    { name: 'Yarraville Library', url: 'https://www.maribyrnong.vic.gov.au/library/Visit/Locations-and-Hours/Yarraville-Library', address: '32 Wembley Avenue', suburb: 'Yarraville', phone: '(03) 9688 0294' },
  ],
  'melton': [
    { name: 'Caroline Springs Library & Learning Hub', url: 'https://www.melton.vic.gov.au/Out-n-About/Libraries-and-learning/Libraries/Library-opening-hours-and-locations/Caroline-Springs-Library-Learning-Hub', address: '193–201 Caroline Springs Boulevard', suburb: 'Caroline Springs', phone: '(03) 9747 5300' },
    { name: 'Melton Library & Learning Hub', url: 'https://www.melton.vic.gov.au/Out-n-About/Libraries-and-learning/Libraries/Library-opening-hours-and-locations', address: '31 McKenzie Street', suburb: 'Melton', phone: '(03) 9747 5300' },
  ],
  'moonee-valley': [
    { name: 'Ascot Vale Library', url: 'https://libraries.mvcc.vic.gov.au/location-hours', address: '165 Union Road', suburb: 'Ascot Vale', phone: '(03) 9243 1990' },
    { name: 'Avondale Heights Library', url: 'https://libraries.mvcc.vic.gov.au/location-hours', address: '69 Military Road', suburb: 'Avondale Heights', phone: '(03) 9243 1940' },
    { name: 'Flemington Library', url: 'https://libraries.mvcc.vic.gov.au/location-hours', address: '313 Racecourse Road', suburb: 'Flemington', phone: '(03) 9243 1975' },
    { name: 'Niddrie Library', url: 'https://libraries.mvcc.vic.gov.au/location-hours', address: '483 Keilor Road', suburb: 'Niddrie', phone: '(03) 9243 1925' },
    { name: 'Sam Merrifield Library', url: 'https://libraries.mvcc.vic.gov.au/location-hours', address: '762 Mt Alexander Road', suburb: 'Moonee Ponds', phone: '(03) 9243 1950' },
  ],
  'wyndham': [
    { name: 'Hoppers Crossing Library', url: 'https://www.wyndham.vic.gov.au/venues/hoppers-crossing-library', address: 'Pacific Werribee Shopping Centre, Derrimut Road', suburb: 'Hoppers Crossing', phone: '(03) 8734 8999' },
    { name: 'Julia Gillard Library Tarneit', url: 'https://www.wyndham.vic.gov.au/venues/julia-gillard-library-tarneit', address: '150 Sunset Views Boulevard', suburb: 'Tarneit', phone: '(03) 8734 8999' },
    { name: 'Manor Lakes Library', url: 'https://www.wyndham.vic.gov.au/venues', address: '86 Manor Lakes Boulevard', suburb: 'Manor Lakes', phone: '(03) 8734 8999' },
    { name: 'Point Cook Library', url: 'https://www.wyndham.vic.gov.au/venues/point-cook-library', address: '1–21 Cheetham Street', suburb: 'Point Cook', phone: '(03) 9395 7966' },
    { name: 'Werribee Library', url: 'https://www.wyndham.vic.gov.au/venues/werribee-library', address: '1 Wedge Street South', suburb: 'Werribee', phone: '(03) 8734 8999' },
  ],
  'casey': [
    { name: 'Bunjil Place Library', url: 'https://www.connectedlibraries.org.au/branches/', address: '2 Patrick Northeast Drive', suburb: 'Narre Warren', phone: '(03) 8782 3300' },
    { name: 'Cranbourne Library', url: 'https://www.connectedlibraries.org.au/branches/cranbourne/', address: '65 Berwick-Cranbourne Road', suburb: 'Cranbourne', phone: '(03) 5990 0150' },
    { name: 'Doveton Library', url: 'https://www.connectedlibraries.org.au/branches/', address: '28 Autumn Place', suburb: 'Doveton', phone: '(03) 9792 9497' },
    { name: 'Endeavour Hills Library', url: 'https://www.connectedlibraries.org.au/branches/', address: '10 Raymond McMahon Boulevard', suburb: 'Endeavour Hills', phone: '(03) 8782 3400' },
    { name: 'Hampton Park Library', url: 'https://www.connectedlibraries.org.au/branches/', address: '26 Stuart Avenue', suburb: 'Hampton Park', phone: '(03) 8788 8500' },
  ],
  'cardinia': [
    { name: 'Pakenham Library', url: 'https://www.myli.org.au', address: 'Cnr John Street & Henry Street', suburb: 'Pakenham', phone: '(03) 5940 6200' },
    { name: 'Emerald Library', url: 'https://www.myli.org.au', address: '400B Belgrave-Gembrook Road', suburb: 'Emerald', phone: '(03) 5949 4600' },
  ],
}

async function main() {
  let total = 0
  for (const [councilId, libs] of Object.entries(LIBRARIES)) {
    await prisma.library.deleteMany({ where: { councilId } })
    for (const lib of libs) {
      await prisma.library.create({
        data: { councilId, name: lib.name, url: lib.url, address: lib.address, suburb: lib.suburb, phone: lib.phone },
      })
      total++
    }
    console.log(`  ${councilId}: ${libs.length} libraries`)
  }
  console.log(`Done. Seeded ${total} libraries across ${Object.keys(LIBRARIES).length} councils.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
