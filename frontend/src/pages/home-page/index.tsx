/**
 * @file src/pages/home-page/index.tsx
 */

import WhoCanRegister from "./who-can-register";
import HowDoesItWork from "./how-does-it-work";
import CallToAction from "./call-to-action";
import HeroSection from "./hero-section";
import WhyJoinUs from "./why-join-us";

function HomePage() {
  return (
    <>
      <title>CareerHub | Your Future Starts Here</title>
      <meta
        name="description"
        content={
          "Découvrez nos opportunités d'emploi et postulez en quelques clics. Browse our database of job offers and find the one that matches your skills. Whether you are a beginner or an expert, find the job that suits you."
        }
      />

      <HeroSection />

      <WhyJoinUs />

      <HowDoesItWork />

      <WhoCanRegister />

      <CallToAction />
    </>
  );
}

export default HomePage;
