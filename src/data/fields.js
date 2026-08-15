export const fields = [
  { id: 'field-1', name: 'Wheat Field', nameHi: 'गेहूं का खेत', crop: 'Wheat', cropHi: 'गेहूं', area: '2.5 Acres', areaHi: '2.5 एकड़', stage: 'Grain Filling', stageHi: 'दाना भराव', moisture: 28, status: 'Healthy', statusHi: 'स्वस्थ', color: 'bg-primary', tone: 'bg-primary-50 text-primary' },
  { id: 'field-2', name: 'Potato Patch', nameHi: 'आलू का खेत', crop: 'Potato', cropHi: 'आलू', area: '1.2 Acres', areaHi: '1.2 एकड़', stage: 'Tuber Formation', stageHi: 'कंद निर्माण', moisture: 41, status: 'Attention', statusHi: 'ध्यान दें', color: 'bg-warning', tone: 'bg-amber-50 text-amber-700' },
  { id: 'field-3', name: 'Mustard Plot', nameHi: 'सरसों का खेत', crop: 'Mustard', cropHi: 'सरसों', area: '1.0 Acres', areaHi: '1.0 एकड़', stage: 'Flowering', stageHi: 'फूल अवस्था', moisture: 32, status: 'Healthy', statusHi: 'स्वस्थ', color: 'bg-primary', tone: 'bg-primary-50 text-primary' },
]

export const localizeField = (field, language) => language === 'hi' ? { ...field, name: field.nameHi, crop: field.cropHi, area: field.areaHi, stage: field.stageHi, status: field.statusHi } : field

export const timeline = [
  ['Sowing', '15 Nov', true], ['Germination', '22 Nov', true], ['Tillering', '10 Dec', true], ['Stem Extension', '05 Jan', true], ['Heading', '20 Jan', true], ['Grain Filling', '10 Feb', true], ['Harvest', '20 Mar', false],
]
