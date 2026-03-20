export const SPECIALTY_HUBS = [
  {
    slug: 'plastic-reconstructive',
    title: 'Plastic & Reconstructive Surgery',
    categories: ['Plastic & Reconstructive Surgery'],
    description: 'Microsurgery, reconstructive, aesthetic, and academic plastic surgery meetings with resident-friendly and regional coverage.',
  },
  {
    slug: 'metabolic-abdominal-wall',
    title: 'Metabolic & Abdominal Wall Reconstructive Surgery',
    categories: ['Metabolic & Abdominal Wall Reconstructive Surgery'],
    description: 'Bariatric, hernia, and abdominal wall meetings with deadline tracking and planning-ready exports.',
  },
  {
    slug: 'vascular',
    title: 'Vascular Surgery',
    categories: ['Vascular Surgery'],
    description: 'Major vascular, endovascular, and regional vascular society meetings from 2024 onward.',
  },
  {
    slug: 'cardiothoracic',
    title: 'Thoracic / Cardiothoracic Surgery',
    categories: ['Cardiothoracic Surgery', 'Cardiovascular Surgery', 'Thoracic Surgery'],
    description: 'Cardiothoracic, cardiovascular, and thoracic surgery meetings grouped into one planning hub.',
  },
  {
    slug: 'surgical-oncology',
    title: 'Surgical Oncology',
    categories: ['Breast & Melanoma Surgical Oncology'],
    description: 'Surgical oncology coverage focused on breast, melanoma, and cancer-oriented surgical meetings.',
  },
  {
    slug: 'colorectal',
    title: 'Colorectal Surgery',
    categories: ['Colon and Rectal Surgery'],
    description: 'Colorectal surgery meetings, deadlines, and historical context for recurring annual events.',
  },
  {
    slug: 'endocrine',
    title: 'Endocrine Surgery',
    categories: ['Endocrine Surgery'],
    description: 'Endocrine surgery meetings with source trust, planning metadata, and export support.',
  },
  {
    slug: 'trauma-critical-care-general',
    title: 'Trauma, Critical Care, and General Surgery',
    categories: ['Trauma, Critical Care, and General Surgery'],
    description: 'Broad surgery, trauma, acute care, and academic general surgery meetings with regional and society coverage.',
  },
];

export function getSpecialtyHub(slug) {
  return SPECIALTY_HUBS.find((hub) => hub.slug === slug) || null;
}

export function getConferencesForHub(conferences, hub) {
  return conferences.filter((conference) =>
    conference.categories.some((category) => hub.categories.includes(category))
  );
}
