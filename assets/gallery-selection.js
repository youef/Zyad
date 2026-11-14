import {CARD_PRESETS} from './templates.js?v=awan-ios2';
import {familyFor} from './card-style-families.js?v=awan-ios2';

const preferredCalendars = new Set([
  'royal', 'modern', 'night', 'desert', 'pearl', 'najdi',
  'islamic-geometry', 'friday', 'salary', 'eid'
]);
const preferredAgendas = new Set([
  'blue-agenda', 'mint-schedule', 'rainbow-brush', 'saudi-list',
  'financial-table', 'metro-timeline', 'week-journal', 'desert-journal'
]);

export function galleryLayoutKey(preset) {
  if (preset.inspiration) return 'illustration:' + preset.inspiration;
  const format = preset.calendar?.layout === 'list' ? 'agenda' : 'calendar';
  return format + ':' + familyFor(preset);
}

export const GALLERY_PRESETS = Object.freeze(CARD_PRESETS.filter(preset =>
  preset.inspiration || preferredCalendars.has(preset.id) || preferredAgendas.has(preset.id)
));

const layoutById = new Map(CARD_PRESETS.map(preset => [preset.id, galleryLayoutKey(preset)]));
const featuredByLayout = new Map(GALLERY_PRESETS.map(preset => [galleryLayoutKey(preset), preset.id]));

export function galleryPresetId(id) {
  return featuredByLayout.get(layoutById.get(id));
}
