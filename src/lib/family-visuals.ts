import moto from '../assets/photos/moto-delivery.jpg';
import packing from '../assets/photos/packing.jpg';
import team from '../assets/photos/team-warehouse.jpg';
import type { IconName } from './icons';
import type { Photo } from './photos';

export type DiscTone = 'deep' | 'olive' | 'red';

export interface FamilyVisual {
  /** 1400px-wide sources can fill the responsive card grid without upscaling. */
  photo: Photo;
  icon: IconName;
  tone: DiscTone;
}

const visuals: Record<string, FamilyVisual> = {
  'personal-y-talento': {
    photo: {
      image: team,
      alt: 'Equipo de Logispack en una bodega: una colaboradora sonríe mientras consulta una tableta junto a dos compañeros',
    },
    icon: 'users',
    tone: 'deep',
  },
  'maquila-y-fulfillment': {
    photo: {
      image: packing,
      alt: 'Operario de Logispack con guantes sellando una caja sobre una banda transportadora en una bodega',
    },
    icon: 'package',
    tone: 'olive',
  },
  'logistica-y-ultima-milla': {
    photo: {
      image: moto,
      alt: 'Repartidor de Logispack en motocicleta con mochila de reparto en una avenida con árboles',
    },
    icon: 'map-pin',
    tone: 'red',
  },
};

/** Photo, icon and disc tone for a service family. Throws so a new family cannot ship without one. */
export function getFamilyVisual(familyId: string): FamilyVisual {
  const visual = visuals[familyId];
  if (!visual) throw new Error(`No visual defined for family: ${familyId}`);
  return visual;
}
