export const STANDARD_CATEGORIES = [
  'Breast & Melanoma Surgical Oncology',
  'Cardiothoracic Surgery',
  'Cardiovascular Surgery',
  'Colon and Rectal Surgery',
  'Endocrine Surgery',
  'Hepatobiliary and Pancreas Surgery',
  'Metabolic & Abdominal Wall Reconstructive Surgery',
  'Neurologic Surgery',
  'Obstetrics and Gynecology Surgery',
  'Oral and Maxillofacial Surgery',
  'Orthopedic Surgery',
  'Otolaryngology / Head and Neck Surgery',
  'Pediatric Surgery',
  'Plastic & Reconstructive Surgery',
  'Thoracic Surgery',
  'Trauma, Critical Care, and General Surgery',
  'Vascular Surgery',
];

export const REGION_GROUPS = ['United States', 'Canada', 'Other International'];

export function getRegionLabel(conference) {
  return conference.regionGroup;
}
