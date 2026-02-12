import { Button, HelperText, Label, Spinner, TextInput } from "flowbite-react";
import { Link } from "react-router-dom"; // Importation du composant Link pour la navigation
import useForgotPassword from "./useForgotPassword";

const ForgotPassword = () => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting } = useForgotPassword();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full sm:w-[800px] flex rounded-lg shadow-lg overflow-hidden">
        
        {/* Left side - Welcome section */}
        <div className="bg-blue-500 p-8 w-full sm:w-1/2 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-2">Mot de Passe Oublié</h2>
          <p className="mb-6">Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>

        {/* Right side - Forgot Password Form */}
        <div className="bg-white p-8 w-full sm:w-1/2">
          <h2 className="text-2xl font-bold mb-6">Réinitialisation du Mot de Passe</h2>

          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Email Field */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" color={errors.email && "failure"}>
                  Votre email
                </Label>
              </div>
              <TextInput
                id="email"
                type="email"
                sizing="md"
                {...register("email")}
                color={errors.email && "failure"}
              />
              {errors.email && (
                <HelperText color={errors.email && "failure"}>
                  <span className="font-medium">Oops!</span> {errors.email.message}
                </HelperText>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    size="sm"
                    color="info"
                    className="me-1"
                    aria-label="Submitting To Reset Password..."
                  />
                  Chargement...
                </>
              ) : (
                "Soumettre"
              )}
            </Button>
          </form>

          {/* Links for Register and Login */}
          <div className="mt-4 text-center">
            <HelperText>
              Vous n'avez pas de compte ?{" "}
              <Link
                to="/register"
                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
              >
                Inscrivez-vous
              </Link>
            </HelperText>
            <HelperText>
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
              >
                Connectez-vous
              </Link>
            </HelperText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
