
import {
  PremiereImpression,
  PourquoiNousRejoindre,
  CommentCaMarche,
  TemoignagesDeNosCollaborateurs,
  RejoignezNotreEntreprise,
} from "../../components/home";

const Home = () => {


  return (
    <>
      <PremiereImpression />
      <div className="divide-y divide-gray-100 dark:divide-gray-600">
        <PourquoiNousRejoindre />
        <CommentCaMarche />
        <TemoignagesDeNosCollaborateurs />
        <RejoignezNotreEntreprise />
      </div>
    </>
  );
};

export default Home;
