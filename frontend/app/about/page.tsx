"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import "./about.css";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section className="premium-about">

        {/* LEFT */}
        <div className="about-left">
          <h1>
            AESTHETICS 
            COMPLEMENT <br />
            COMFORT
          </h1>

          <p>
            Dietara redefines healthy living through intelligent nutrition. 
            By combining AI-powered diet planning, expert dietician guidance
            and a dedicated dietary kitchen, we create a seamless and premium 
            experience tailored to every individual.

            <br /><br />

            We don’t just suggest diets — we make them practical, sustainable, 
            and easy to follow in everyday life.
          </p>
        </div>

        {/* RIGHT IMAGES */}
        <div className="about-images">

          <div className="img img1">
            <Image src="/plate.jpg" alt="Healthy Meal" fill className="img-fit" />
          </div>

          <div className="img img2">
            <Image src="/plate2.jpg" alt="Diet Food" fill className="img-fit" />
          </div>

          <div className="img img3">
            <Image src="/plate3.jpg" alt="Meal Plan" fill className="img-fit" />
          </div>

        </div>

      </section>
    </>
  );
}