import type { ModularGame } from '@/lib/movie-night';
import type { AnyGameModule } from './module';
import pares from './pares';
import poruno from './poruno';
import robar from './robar';
import subasta from './subasta';
import reversi from './reversi';
import cinco from './cinco';
import mancala from './mancala';
import generala from './generala';
import mentiroso from './mentiroso';
import duelo from './duelo';
import colores from './colores';
import anagrama from './anagrama';
import dibujo from './dibujo';
import conocer from './conocer';

/** The modular games, by id. Adding one: its id in `MODULAR_GAMES`, its module here. */
export const MODULES: Record<ModularGame, AnyGameModule> = {
  pares,
  poruno,
  robar,
  subasta,
  reversi,
  cinco,
  mancala,
  generala,
  mentiroso,
  duelo,
  colores,
  anagrama,
  dibujo,
  conocer,
};
