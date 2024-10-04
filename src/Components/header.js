import React from "react";
import styles from "./header.css";

export default function Header() {
  <div className={styles.header}>
    <h1>GalleRoonn</h1>
    <div className={styles.headerItems}>
      <img
        src="/Images/Dogs/dogIcon.jpg"
        alt="Dogssss"
        className={styles.iconImage}
        onClick={console.log("clicked")}
      />
      <img
        src="/Images/Cats/catIcon.jpg"
        alt="Catssss"
        className={styles.iconImage}
      />
      <img
        src="/Images/Palm/palmIcon.jpg"
        alt="Palm"
        className={styles.iconImage}
      />
      <img
        src="/Images/Palm/otherIcon.jpg"
        alt="Others"
        className={styles.iconImage}
      />
    </div>
  </div>;
}
