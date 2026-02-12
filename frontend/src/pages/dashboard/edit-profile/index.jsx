import {
  Button,
  FileInput,
  HelperText,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useProfileContext } from "../../../hooks/useProfileContext";
import useEditProfile from "./useEditProfile";
import {
  FaUser,
  FaMapMarkerAlt,
  FaFilePdf,
  FaVenusMars,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const EditProfile = () => {
  const { user, fetchProfile } = useProfileContext();
  const { register, handleSubmit, onSubmit, errors, isSubmitting } =
    useEditProfile(user, fetchProfile);

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900 opacity-10" />

      <section className="py-6 px-4 sm:px-6 min-h-screen flex justify-center items-center relative z-10">
        <div className="w-full max-w-lg sm:max-w-2xl h-auto rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-gray-400 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-blue-500">
          {/* Formulaire */}
          <div className="w-full p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-100 text-center">
              Modifier le Profil
            </h2>
            <form
              className="w-full grid gap-6 sm:grid-cols-2"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Nom d'utilisateur */}
              <div className="sm:col-span-1">
                <Label
                  htmlFor="username"
                  color={errors.username && "failure"}
                  className="text-gray-100 flex items-center gap-2"
                >
                  <FaUser className="text-blue-400" />
                  Nom d'utilisateur
                </Label>
                <TextInput
                  id="username"
                  sizing="md"
                  placeholder="Entrez votre nom d'utilisateur"
                  {...register("username")}
                  color={errors.username && "failure"}
                  aria-invalid={errors.username ? "true" : "false"}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  className="mt-1 rounded-lg shadow-sm hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 bg-white"
                />
                {errors.username && (
                  <HelperText id="username-error" color="failure" className="flex items-center gap-1">
                    <FaExclamationCircle className="text-red-500" />
                    <span className="font-medium">Erreur :</span>{" "}
                    {errors.username.message}
                  </HelperText>
                )}
              </div>

              {/* Emplacement */}
              <div className="sm:col-span-1">
                <Label
                  htmlFor="location"
                  color={errors.location && "failure"}
                  className="text-gray-100 flex items-center gap-2"
                >
                  <FaMapMarkerAlt className="text-blue-400" />
                  Emplacement
                </Label>
                <TextInput
                  id="location"
                  sizing="md"
                  placeholder="Entrez votre ville"
                  {...register("location")}
                  color={errors.location && "failure"}
                  aria-invalid={errors.location ? "true" : "false"}
                  aria-describedby={errors.location ? "location-error" : undefined}
                  className="mt-1 rounded-lg shadow-sm hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 bg-white"
                />
                {errors.location && (
                  <HelperText id="location-error" color="failure" className="flex items-center gap-1">
                    <FaExclamationCircle className="text-red-500" />
                    <span className="font-medium">Erreur :</span>{" "}
                    {errors.location.message}
                  </HelperText>
                )}
              </div>

              {/* CV PDF (Conditionnel) */}
              {user?.role === "user" && (
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="pdf"
                    className="text-gray-100 flex items-center gap-2"
                  >
                    <FaFilePdf className="text-blue-400" />
                    CV PDF
                  </Label>
                  <FileInput
                    id="pdf"
                    sizing="md"
                    accept="application/pdf"
                    {...register("pdf")}
                    className="mt-1 rounded-lg shadow-sm hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-800 transition-all duration-200 transform hover:scale-105 bg-white"
                  />
                  <HelperText>
                    Téléchargez un fichier PDF (max. 5 Mo).
                  </HelperText>
                </div>
              )}

              {/* Genre */}
              <div className="sm:col-span-2">
                <Label
                  htmlFor="gender"
                  color={errors.gender && "failure"}
                  className="text-gray-100 flex items-center gap-2"
                >
                  <FaVenusMars className="text-blue-400" />
                  Genre
                </Label>
                <Select
                  id="gender"
                  sizing="md"
                  {...register("gender")}
                  color={errors.gender && "failure"}
                  aria-invalid={errors.gender ? "true" : "false"}
                  aria-describedby={errors.gender ? "gender-error" : undefined}
                  className="mt-1 rounded-lg shadow-sm hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 bg-white"
                >
                  <option value="">Sélectionnez un genre</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </Select>
                {errors.gender && (
                  <HelperText id="gender-error" color="failure" className="flex items-center gap-1">
                    <FaExclamationCircle className="text-red-500" />
                    <span className="font-medium">Erreur :</span>{" "}
                    {errors.gender.message}
                  </HelperText>
                )}
              </div>

              {/* Bouton Soumettre */}
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-full font-medium shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        size="sm"
                        color="info"
                        className="mr-2"
                        aria-label="Envoi des modifications du profil"
                      />
                      Envoi...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaCheck />
                      Enregistrer
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;