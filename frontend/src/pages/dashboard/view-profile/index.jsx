import { useProfileContext } from "../../../hooks/useProfileContext";
import { Loading } from "../../../components/feedback";
import ProfileCard from "./ProfileCard";

const ViewProfile = () => {
  const { loading, userStatus } = useProfileContext();

  return (
    <Loading loading={loading} error={userStatus.message}>
      <section className="flex-1 h-screen bg-gray-100">
        <div className="h-full">
          <ProfileCard />
        </div>
      </section>
    </Loading>
  );
};

export default ViewProfile;