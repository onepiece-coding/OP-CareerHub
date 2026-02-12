import { useProfileContext } from "../../../hooks/useProfileContext";
import { Badge } from "flowbite-react";

// Icônes pour les infos
const icons = {
  mail: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  calendar: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  location: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  gender: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

// Composant Info avec hover + fond gris opaque
const ProfileInfo = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-500 bg-gray-700 p-3 shadow-md transition-all duration-300 hover:bg-gray-600 hover:shadow-lg hover:border-blue-500 cursor-pointer">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-300 text-blue-600">
      {icons[icon]}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  </div>
);

// Composant principal
const ProfileCard = () => {
  const { user, uploading, image, chooseFile, profilePhotoUpload } = useProfileContext();
  const imageUrl = image ? URL.createObjectURL(image) : user?.profilePhoto?.url;

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
      }}
    >
      {/* Overlay foncé (plus opaque) */}
      <div className="absolute inset-0 bg-gray-800 opacity-70" />

      <div className="flex items-center justify-center min-h-screen px-4 py-8 relative z-10">
        <div className="relative w-full max-w-4xl h-[500px] flex rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-gray-500 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-500">
          {/* Section Profil */}
          <div className="w-full p-8 flex flex-col justify-center gap-6">
            <div className="flex flex-col items-center gap-3">
              {/* Photo de profil */}
              <div className="relative group w-32 h-32">
                <label htmlFor="upload" className="cursor-pointer group">
                  <img
                    src={imageUrl}
                    alt={user?.username}
                    className="w-full h-full rounded-full object-cover border-4 border-white/50 shadow-lg transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-blue bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Changer</span>
                  </div>
                </label>
                <input
                  type="file"
                  id="upload"
                  className="hidden"
                  onChange={chooseFile}
                  accept="image/*"
                />
                {image && (
                  <Badge
                    color="info"
                    className="absolute bottom-0 right-0 cursor-pointer"
                    onClick={profilePhotoUpload}
                  >
                    {uploading ? "⏳" : "📤"}  
                  </Badge>
                )}
              </div>

              {/* Nom et rôle */}
              <h3 className="text-xl font-bold text-white">{user?.username}</h3>
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                {user?.role}
              </span>

              {/* Bouton modification */}
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-800 transition-all duration-300"
                onClick={() => window.location.href = `/dashboard/edit-profile/${user._id}`}
              >
                Modifier le profil
              </button>
            </div>

            {/* Infos détaillées */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ProfileInfo label="Email" value={user?.email} icon="mail" />
              <ProfileInfo label="Inscrit le" value={new Date(user?.createdAt).toLocaleDateString()} icon="calendar" />
              <ProfileInfo label="Emplacement" value={user?.location || "Non disponible"} icon="location" />
              <ProfileInfo label="Genre" value={user?.gender || "Non disponible"} icon="gender" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
