import type { FloatingWish } from '../types';
import FloatingKrathong from './FloatingKrathong';

interface Props {
  wishes: FloatingWish[];
  selectedId: string | null;
  ownTagId?: string | null;
  onSelect: (w: FloatingWish) => void;
}

/** 願望之河 */
export default function RiverOfKrathongs({ wishes, selectedId, ownTagId, onSelect }: Props) {
  return (
    <div className="lk-river" aria-label="願望之河">
      {wishes.map((w) => (
        <FloatingKrathong
          key={w.id}
          wish={w}
          active={selectedId === w.id}
          showOwnTag={ownTagId === w.id}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
