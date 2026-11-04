interface Props {
  onOpen: () => void;
}

export default function WishCTA({ onOpen }: Props) {
  return (
    <button
      className="lk-cta"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      ✦ 許下你的願望 · ลอยกระทง ✦
    </button>
  );
}
