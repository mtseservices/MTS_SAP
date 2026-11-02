export interface ProvinceData {
  province: string;
  cities: string[];
}

export const PAKISTAN_PROVINCES_CITIES: ProvinceData[] = [
  {
    province: 'Punjab',
    cities: [
      'Lahore',
      'Faisalabad',
      'Rawalpindi',
      'Multan',
      'Gujranwala',
      'Sialkot',
      'Bahawalpur',
      'Sargodha',
      'Sheikhupura',
      'Jhang',
      'Rahim Yar Khan',
      'Gujrat',
      'Kasur',
      'Sahiwal',
      'Okara',
      'Wah Cantonment',
      'Dera Ghazi Khan',
      'Chiniot',
      'Kamoke',
      'Hafizabad'
    ]
  },
  {
    province: 'Sindh',
    cities: [
      'Karachi',
      'Hyderabad',
      'Sukkur',
      'Larkana',
      'Nawabshah',
      'Mirpur Khas',
      'Jacobabad',
      'Shikarpur',
      'Khairpur',
      'Dadu',
      'Tando Adam',
      'Ghotki',
      'Badin',
      'Kotri',
      'Tando Allahyar'
    ]
  },
  {
    province: 'Khyber Pakhtunkhwa (KP)',
    cities: [
      'Peshawar',
      'Mardan',
      'Mingora',
      'Abbottabad',
      'Mansehra',
      'Swabi',
      'Nowshera',
      'Charsadda',
      'Kohat',
      'Dera Ismail Khan',
      'Bannu',
      'Timargara',
      'Haripur'
    ]
  },
  {
    province: 'Balochistan',
    cities: [
      'Quetta',
      'Khuzdar',
      'Turbat',
      'Sibi',
      'Hub',
      'Chaman',
      'Gwadar',
      'Dera Murad Jamali',
      'Usta Muhammad',
      'Loralai',
      'Zhob'
    ]
  },
  {
    province: 'Islamabad Capital Territory (ICT)',
    cities: [
      'Islamabad',
      'Rawal Town',
      'Golra',
      'Tarlai',
      'Nilore'
    ]
  },
  {
    province: 'Azad Jammu & Kashmir (AJK)',
    cities: [
      'Muzaffarabad',
      'Mirpur',
      'Rawalakot',
      'Bhimber',
      'Kotli',
      'Poonch',
      'Hajira'
    ]
  },
  {
    province: 'Gilgit-Baltistan (GB)',
    cities: [
      'Gilgit',
      'Skardu',
      'Diamer',
      'Hunza',
      'Ghizer',
      'Astore',
      'Ghanche'
    ]
  }
];

export function getCitiesForProvince(provinceName: string): string[] {
  const found = PAKISTAN_PROVINCES_CITIES.find(p => p.province.toLowerCase() === provinceName.toLowerCase());
  return found ? found.cities : ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad'];
}
