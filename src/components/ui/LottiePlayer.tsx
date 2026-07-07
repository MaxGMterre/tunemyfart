import { useState, useEffect } from "react";
import Lottie from "lottie-react";

interface Props {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function LottiePlayer({ src, loop = true, autoplay = true, onComplete, className, style }: Props) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    setData(null);
    fetch(src)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {}); // silent fail if placeholder
  }, [src]);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      onComplete={onComplete}
      className={className}
      style={style}
    />
  );
}
