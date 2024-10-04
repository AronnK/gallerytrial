import React, { useState, useEffect } from "react";
import {
  useSprings,
  animated,
  to as interpolate,
  useSpring,
} from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import styles from "./styles.module.css";
import Header from "./Components/header";

const cards = [
  "/Images/Cats/cat1.jpg",
  "/Images/Dogs/dog1.jpg",
  "/Images/Palm/palm1.jpg",
];
const albums = {
  Cats: [
    "/Images/Cats/cat1.jpg",
    "/Images/Cats/cat2.jpg",
    "/Images/Cats/cat3.jpg",
    "/Images/Cats/cat4.jpg",
    "/Images/Cats/cat5.jpg",
    "/Images/Cats/cat6.jpg",
    "/Images/Cats/cat7.jpg",
    "/Images/Cats/cat8.jpg",
    "/Images/Cats/cat9.jpg",
    "/Images/Cats/cat10.jpg",
  ],
  Dogs: [
    "/Images/Dogs/dog1.jpg",
    "/Images/Dogs/dog2.jpg",
    "/Images/Dogs/dog3.jpg",
    "/Images/Dogs/dog4.jpg",
  ],
  Palm: [
    "/Images/Palm/palm1.jpg",
    "/Images/Palm/palm2.jpg",
    "/Images/Palm/palm3.jpg",
    "/Images/Palm/palm4.jpg",
  ],
};
const to = (i) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
});

const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

export default function App() {
  const [gone, setGone] = useState(() => new Set());
  const [topCardIndex, setTopCardIndex] = useState(cards.length - 1);
  const [clickedCard, setClickedCard] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [showPolaroid, setShowPolaroid] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);
  const scrollCooldown = 1000;

  const [props, api] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  const [bgSpring, setBgSpring] = useSpring(() => ({
    opacity: 1,
    transform: "scale(1.1)",
    config: { duration: 500 },
  }));

  const bind = useDrag(
    ({
      args: [index],
      down,
      movement: [mx, my],
      direction: [xDir, yDir],
      velocity,
    }) => {
      const trigger = velocity > 0.2;
      const dirX = xDir < 0 ? -1 : 1;
      const dirY = yDir < 0 ? -1 : 1;

      if (!down && trigger) {
        gone.add(index);
        setGone(new Set(gone));
        const remainingIndices = [...Array(cards.length).keys()].filter(
          (i) => !gone.has(i)
        );
        const newIndex = remainingIndices[remainingIndices.length - 1] || 0;

        setTopCardIndex(newIndex);
        setBgSpring.start({
          opacity: 1,
          transform: "scale(1.05)",
          onRest: () => {
            setBgSpring.start({
              opacity: 2,
              transform: "scale(1)",
            });
          },
        });
      }

      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.has(index);
        const x = isGone ? (200 + window.innerWidth) * dirX : down ? mx : 0;
        const y = isGone ? (200 + window.innerHeight) * dirY : down ? my : 0;
        const scale = down ? 1.1 : 1;

        return {
          x,
          y,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      if (!down && gone.size === cards.length) {
        setTimeout(() => {
          gone.clear();
          setGone(new Set());
          api.start((i) => to(i));
          setTopCardIndex(cards.length - 1);
        }, 600);
      }
    }
  );

  const handleCardClick = (albumKey) => {
    setClickedCard(albumKey);
    setThumbnails(albums[albumKey]);
    setShowPolaroid(true);
    setCurrentImageIndex(0);
  };

  const handleClosePolaroid = () => {
    setShowPolaroid(false);
    setCurrentImageIndex(0);
  };

  const handleImageChange = (direction) => {
    setImageOpacity(0);
    const currentTime = new Date().getTime();
    if (currentTime - lastKeyPressTime < scrollCooldown) return;
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex =
          direction > 0
            ? Math.min(prevIndex + 1, thumbnails.length - 1)
            : Math.max(prevIndex - 1, 0);
        return nextIndex;
      });
      setImageOpacity(1);
    }, 500);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleClosePolaroid();
    }
    const currentTime = new Date().getTime();
    if (currentTime - lastKeyPressTime < scrollCooldown) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      handleImageChange(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      handleImageChange(-1);
    }

    setLastKeyPressTime(currentTime);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lastKeyPressTime, showPolaroid]);

  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          {showPolaroid ? (
            <div className={styles.polaroidContainer}>
              <button
                className={styles.closeButton}
                onClick={handleClosePolaroid}
              >
                &times;
              </button>
              <div className={styles.polaroidContent}>
                <animated.img
                  src={thumbnails[currentImageIndex]}
                  alt={`Thumbnail ${currentImageIndex}`}
                  style={{
                    opacity: imageOpacity,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <animated.div
                className={styles.backgroundDiv}
                style={{
                  ...bgSpring,
                  backgroundImage: `url(${cards[topCardIndex]})`,
                }}
              />
              {props.map(({ x, y, rot, scale }, i) => (
                <animated.div className={styles.deck} key={i} style={{ x, y }}>
                  <animated.div
                    {...bind(i)}
                    style={{
                      transform: interpolate([rot, scale], trans),
                      backgroundImage: `url(${cards[i]})`,
                    }}
                    onDoubleClick={() =>
                      handleCardClick(Object.keys(albums)[i])
                    }
                  />
                </animated.div>
              ))}
            </>
          )}
        </div>
        {clickedCard && showPolaroid && (
          <div className={styles.thumbnailContainer}>
            <div className={styles.mainImage}>
              <img src={thumbnails[currentImageIndex]} alt="Main" />
            </div>
            <div className={styles.thumbnailList}>
              {thumbnails.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`thumb-${index}`}
                  className={styles.thumbnail}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
