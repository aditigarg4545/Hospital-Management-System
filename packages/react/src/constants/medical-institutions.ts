// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Predefined list of Indian medical degree issuing institutions.
 * This list includes both private and government medical schools/colleges in India.
 */

// AIIMS (All India Institute of Medical Sciences) - Central Government
const AIIMS_INSTITUTIONS = [
  'All India Institute of Medical Sciences (AIIMS), New Delhi',
  'AIIMS, Bhopal',
  'AIIMS, Bhubaneswar',
  'AIIMS, Jodhpur',
  'AIIMS, Patna',
  'AIIMS, Raipur',
  'AIIMS, Rishikesh',
  'AIIMS, Gorakhpur',
  'AIIMS, Nagpur',
  'AIIMS, Mangalagiri',
  'AIIMS, Bibinagar',
  'AIIMS, Kalyani',
  'AIIMS, Deoghar',
  'AIIMS, Guwahati',
  'AIIMS, Rajkot',
  'AIIMS, Bathinda',
  'AIIMS, Raebareli',
  'AIIMS, Darbhanga',
  'AIIMS, Bilaspur',
  'AIIMS, Madurai',
];

// Central Government Medical Colleges
const CENTRAL_GOVERNMENT_COLLEGES = [
  'Armed Forces Medical College (AFMC), Pune',
  'Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER), Puducherry',
  'Post Graduate Institute of Medical Education and Research (PGIMER), Chandigarh',
  'National Institute of Mental Health and Neurosciences (NIMHANS), Bangalore',
];

// State Government Medical Colleges - Delhi
const DELHI_MEDICAL_COLLEGES = [
  'Maulana Azad Medical College, New Delhi',
  'Lady Hardinge Medical College, New Delhi',
  'University College of Medical Sciences (UCMS), New Delhi',
  'Vardhman Mahavir Medical College & Safdarjung Hospital, New Delhi',
];

// State Government Medical Colleges - Maharashtra
const MAHARASHTRA_MEDICAL_COLLEGES = [
  'Grant Medical College, Mumbai',
  'Seth GS Medical College, Mumbai',
  'Topiwala National Medical College, Mumbai',
  'Lokmanya Tilak Municipal Medical College, Mumbai',
  'B.J. Medical College, Pune',
  'Government Medical College, Nagpur',
  'Government Medical College, Aurangabad',
  'Government Medical College, Akola',
  'Government Medical College, Latur',
  'Government Medical College, Miraj',
  'Government Medical College, Solapur',
  'Government Medical College, Dhule',
  'Government Medical College, Nanded',
  'Government Medical College, Ambejogai',
  'Government Medical College, Gondia',
  'Government Medical College, Chandrapur',
  'Government Medical College, Jalgaon',
  'Government Medical College, Yavatmal',
  'Government Medical College, Alibag',
  'Government Medical College, Karad',
];

// State Government Medical Colleges - Tamil Nadu
const TAMIL_NADU_MEDICAL_COLLEGES = [
  'Madras Medical College, Chennai',
  'Stanley Medical College, Chennai',
  'Kilpauk Medical College, Chennai',
  'Chengalpattu Medical College, Chengalpattu',
  'Coimbatore Medical College, Coimbatore',
  'Madurai Medical College, Madurai',
  'Tirunelveli Medical College, Tirunelveli',
  'Thanjavur Medical College, Thanjavur',
  'Government Medical College, Salem',
  'Government Medical College, Vellore',
  'Government Medical College, Trichy',
  'Government Medical College, Erode',
  'Government Medical College, Dharmapuri',
  'Government Medical College, Villupuram',
  'Government Medical College, Theni',
  'Government Medical College, Sivaganga',
  'Government Medical College, Karur',
  'Government Medical College, Namakkal',
  'Government Medical College, Dindigul',
  'Government Medical College, Pudukkottai',
];

// State Government Medical Colleges - Kerala
const KERALA_MEDICAL_COLLEGES = [
  'Government Medical College, Thiruvananthapuram',
  'Government Medical College, Kozhikode',
  'Government Medical College, Thrissur',
  'Government Medical College, Kottayam',
  'Government Medical College, Ernakulam',
  'Government Medical College, Alappuzha',
  'Government Medical College, Manjeri',
  'Government Medical College, Idukki',
  'Government Medical College, Palakkad',
  'Government Medical College, Kannur',
  'Government Medical College, Kollam',
  'Government Medical College, Wayanad',
];

// State Government Medical Colleges - Karnataka
const KARNATAKA_MEDICAL_COLLEGES = [
  'Bangalore Medical College and Research Institute, Bangalore',
  'Mysore Medical College, Mysore',
  'Government Medical College, Hubli',
  'Government Medical College, Bellary',
  'Government Medical College, Mandya',
  'Government Medical College, Raichur',
  'Government Medical College, Gulbarga',
  'Government Medical College, Shimoga',
  'Government Medical College, Bidar',
  'Government Medical College, Hassan',
  'Government Medical College, Chamarajanagar',
  'Government Medical College, Karwar',
];

// State Government Medical Colleges - West Bengal
const WEST_BENGAL_MEDICAL_COLLEGES = [
  'Calcutta Medical College, Kolkata',
  'NRS Medical College, Kolkata',
  'RG Kar Medical College, Kolkata',
  'Bankura Sammilani Medical College, Bankura',
  'Burdwan Medical College, Bardhaman',
  'North Bengal Medical College, Siliguri',
  'Midnapore Medical College, Midnapore',
  'Murshidabad Medical College, Murshidabad',
  'Malda Medical College, Malda',
  'Diamond Harbour Medical College, Diamond Harbour',
  'Government Medical College, Purulia',
  'Government Medical College, Cooch Behar',
];

// State Government Medical Colleges - Uttar Pradesh
const UTTAR_PRADESH_MEDICAL_COLLEGES = [
  "King George's Medical University, Lucknow",
  'Government Medical College, Kanpur',
  'Government Medical College, Agra',
  'Government Medical College, Meerut',
  'Government Medical College, Allahabad',
  'Government Medical College, Gorakhpur',
  'Government Medical College, Jhansi',
  'Government Medical College, Bareilly',
  'Government Medical College, Azamgarh',
  'Government Medical College, Saharanpur',
  'Government Medical College, Firozabad',
  'Government Medical College, Banda',
  'Government Medical College, Etawah',
  'Government Medical College, Siddharthnagar',
  'Government Medical College, Ambedkar Nagar',
  'Government Medical College, Orai',
  'Government Medical College, Etah',
  'Government Medical College, Mirzapur',
  'Government Medical College, Pratapgarh',
  'Government Medical College, Basti',
];

// State Government Medical Colleges - Andhra Pradesh
const ANDHRA_PRADESH_MEDICAL_COLLEGES = [
  'Guntur Medical College, Guntur',
  'Government Medical College, Anantapur',
  'Government Medical College, Kurnool',
  'Government Medical College, Nellore',
  'Government Medical College, Vizianagaram',
  'Government Medical College, Kadapa',
  'Government Medical College, Ongole',
  'Government Medical College, Chittoor',
  'Government Medical College, Eluru',
  'Government Medical College, Srikakulam',
];

// State Government Medical Colleges - Telangana
const TELANGANA_MEDICAL_COLLEGES = [
  'Osmania Medical College, Hyderabad',
  'Gandhi Medical College, Hyderabad',
  'Kakatiya Medical College, Warangal',
  'Government Medical College, Nizamabad',
  'Government Medical College, Mahbubnagar',
  'Government Medical College, Suryapet',
  'Government Medical College, Siddipet',
];

// State Government Medical Colleges - Gujarat
const GUJARAT_MEDICAL_COLLEGES = [
  'BJ Medical College, Ahmedabad',
  'Government Medical College, Surat',
  'Government Medical College, Vadodara',
  'Government Medical College, Rajkot',
  'Government Medical College, Bhavnagar',
  'Government Medical College, Jamnagar',
  'Government Medical College, Patan',
  'Government Medical College, Junagadh',
  'Government Medical College, Valsad',
  'Government Medical College, Surendranagar',
  'Government Medical College, Porbandar',
  'Government Medical College, Dahod',
];

// State Government Medical Colleges - Rajasthan
const RAJASTHAN_MEDICAL_COLLEGES = [
  'SMS Medical College, Jaipur',
  'RNT Medical College, Udaipur',
  'JLN Medical College, Ajmer',
  'Government Medical College, Kota',
  'Government Medical College, Bikaner',
  'Government Medical College, Jodhpur',
  'Government Medical College, Alwar',
  'Government Medical College, Bharatpur',
  'Government Medical College, Pali',
  'Government Medical College, Churu',
  'Government Medical College, Dungarpur',
  'Government Medical College, Sikar',
];

// State Government Medical Colleges - Punjab
const PUNJAB_MEDICAL_COLLEGES = [
  'Government Medical College, Patiala',
  'Government Medical College, Amritsar',
  'Government Medical College, Faridkot',
  'Government Medical College, Hoshiarpur',
  'Government Medical College, Sangrur',
];

// State Government Medical Colleges - Haryana
const HARYANA_MEDICAL_COLLEGES = [
  'Pt. B.D. Sharma PGIMS, Rohtak',
  'Government Medical College, Ambala',
  'Government Medical College, Karnal',
  'Government Medical College, Sonipat',
  'Government Medical College, Gurugram',
  'Government Medical College, Bhiwani',
];

// State Government Medical Colleges - Madhya Pradesh
const MADHYA_PRADESH_MEDICAL_COLLEGES = [
  'Gandhi Medical College, Bhopal',
  'Government Medical College, Indore',
  'Government Medical College, Jabalpur',
  'Government Medical College, Gwalior',
  'Government Medical College, Rewa',
  'Government Medical College, Sagar',
  'Government Medical College, Ratlam',
  'Government Medical College, Vidisha',
  'Government Medical College, Khandwa',
  'Government Medical College, Shahdol',
];

// State Government Medical Colleges - Bihar
const BIHAR_MEDICAL_COLLEGES = [
  'Patna Medical College, Patna',
  'Darbhanga Medical College, Darbhanga',
  'Government Medical College, Bhagalpur',
  'Government Medical College, Muzaffarpur',
  'Government Medical College, Gaya',
  'Government Medical College, Bettiah',
  'Government Medical College, Purnia',
  'Government Medical College, Nalanda',
];

// State Government Medical Colleges - Odisha
const ODISHA_MEDICAL_COLLEGES = [
  'SCB Medical College, Cuttack',
  'MKCG Medical College, Berhampur',
  'Government Medical College, Burla',
  'Government Medical College, Rourkela',
  'Government Medical College, Balangir',
  'Government Medical College, Koraput',
];

// State Government Medical Colleges - Assam
const ASSAM_MEDICAL_COLLEGES = [
  'Assam Medical College, Dibrugarh',
  'Gauhati Medical College, Guwahati',
  'Silchar Medical College, Silchar',
  'Jorhat Medical College, Jorhat',
  'Fakhruddin Ali Ahmed Medical College, Barpeta',
  'Tezpur Medical College, Tezpur',
];

// State Government Medical Colleges - Other States
const OTHER_STATE_MEDICAL_COLLEGES = [
  // Jammu & Kashmir
  'Government Medical College, Srinagar',
  'Government Medical College, Jammu',
  'Government Medical College, Anantnag',
  'Government Medical College, Baramulla',
  'Government Medical College, Doda',
  'Government Medical College, Rajouri',

  // Himachal Pradesh
  'Indira Gandhi Medical College, Shimla',
  'Dr. Rajendra Prasad Government Medical College, Tanda',
  'Government Medical College, Mandi',

  // Uttarakhand
  'Government Medical College, Haldwani',
  'Government Medical College, Dehradun',

  // Jharkhand
  'Rajendra Institute of Medical Sciences, Ranchi',
  'MGM Medical College, Jamshedpur',
  'Government Medical College, Dhanbad',
  'Government Medical College, Hazaribagh',

  // Chhattisgarh
  'Government Medical College, Raipur',
  'Government Medical College, Bilaspur',
  'Government Medical College, Jagdalpur',

  // Goa
  'Goa Medical College, Panaji',

  // Manipur
  'Regional Institute of Medical Sciences, Imphal',
  'Jawaharlal Nehru Institute of Medical Sciences, Imphal',

  // Meghalaya
  'North Eastern Indira Gandhi Regional Institute of Health and Medical Sciences, Shillong',

  // Mizoram
  'Zoram Medical College, Falkawn',

  // Nagaland
  'Nagaland Institute of Medical Sciences and Research, Kohima',

  // Tripura
  'Agartala Government Medical College, Agartala',

  // Sikkim
  'Sikkim Manipal Institute of Medical Sciences, Gangtok',

  // Arunachal Pradesh
  'Tomo Riba Institute of Health and Medical Sciences, Naharlagun',
];

// Private Medical Colleges (Major ones)
const PRIVATE_MEDICAL_COLLEGES = [
  'Christian Medical College (CMC), Vellore',
  'Kasturba Medical College, Manipal',
  'JSS Medical College, Mysore',
  'MS Ramaiah Medical College, Bangalore',
  "St. John's Medical College, Bangalore",
  'Amrita Institute of Medical Sciences, Kochi',
  'SRM Medical College, Chennai',
  'PSG Institute of Medical Sciences, Coimbatore',
  'Saveetha Medical College, Chennai',
  'Meenakshi Medical College, Kanchipuram',
  "Vinayaka Mission's Medical College, Salem",
  'Chettinad Hospital and Research Institute, Chennai',
  'Sri Ramachandra Medical College, Chennai',
  'Velammal Medical College, Madurai',
  'Karpagam Faculty of Medical Sciences, Coimbatore',
];

/**
 * Complete list of Indian medical institutions.
 * Sorted alphabetically for easy lookup.
 */
export const INDIAN_MEDICAL_INSTITUTIONS = [
  ...AIIMS_INSTITUTIONS,
  ...CENTRAL_GOVERNMENT_COLLEGES,
  ...DELHI_MEDICAL_COLLEGES,
  ...MAHARASHTRA_MEDICAL_COLLEGES,
  ...TAMIL_NADU_MEDICAL_COLLEGES,
  ...KERALA_MEDICAL_COLLEGES,
  ...KARNATAKA_MEDICAL_COLLEGES,
  ...WEST_BENGAL_MEDICAL_COLLEGES,
  ...UTTAR_PRADESH_MEDICAL_COLLEGES,
  ...ANDHRA_PRADESH_MEDICAL_COLLEGES,
  ...TELANGANA_MEDICAL_COLLEGES,
  ...GUJARAT_MEDICAL_COLLEGES,
  ...RAJASTHAN_MEDICAL_COLLEGES,
  ...PUNJAB_MEDICAL_COLLEGES,
  ...HARYANA_MEDICAL_COLLEGES,
  ...MADHYA_PRADESH_MEDICAL_COLLEGES,
  ...BIHAR_MEDICAL_COLLEGES,
  ...ODISHA_MEDICAL_COLLEGES,
  ...ASSAM_MEDICAL_COLLEGES,
  ...OTHER_STATE_MEDICAL_COLLEGES,
  ...PRIVATE_MEDICAL_COLLEGES,
].sort();

/**
 * @deprecated Use INDIAN_MEDICAL_INSTITUTIONS instead.
 * This export is kept for backward compatibility.
 */
export const MEDICAL_INSTITUTIONS = INDIAN_MEDICAL_INSTITUTIONS;
