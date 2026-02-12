import { Button, HelperText, Label, Spinner, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";
import useAuthForm from "./useAuthForm";
import welcomeImage from "./image1.jpeg"; // N'oublie pas de mettre ton image ici

const Register = () => {
  const {
    register,
    handleSubmit,
    onSubmit,
    handlePasswordVisibility,
    errors,
    loading,
    passwordVisibility,
  } = useAuthForm("register");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full sm:w-[800px] flex rounded-lg shadow-lg overflow-hidden">
        
        {/* Left side - Register Form */}
        <div className="bg-white p-8 w-full sm:w-1/2 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Register</h2>

          <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            
            {/* Username Field */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" color={errors.username && "failure"}>
                  Votre nom d'utilisateur
                </Label>
              </div>
              <TextInput
                id="username"
                type="text"
                sizing="md"
                {...register("username")}
                color={errors.username && "failure"}
              />
              {errors.username && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.username.message}
                </HelperText>
              )}
            </div>

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
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.email.message}
                </HelperText>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" color={errors.password && "failure"}>
                  Votre mot de passe
                </Label>
              </div>
              <div className="relative">
                <TextInput
                  id="password1"
                  type={passwordVisibility ? "text" : "password"}
                  sizing="md"
                  {...register("password")}
                  color={errors.password && "failure"}
                />
                <button
                  type="button"
                  onClick={handlePasswordVisibility}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
                >
                  {passwordVisibility ? (
                    <FaEyeSlash className="w-5 h-5 text-gray-500" />
                  ) : (
                    <FaEye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.password.message}
                </HelperText>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" color="info" className="me-1" aria-label="User Registration..." />
                  Chargement...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>

            {/* Link for login */}
            <HelperText className="mt-3">
              Vous avez déjà un compte ?{" "}
              <Link to={"/login"} className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                Se connecter
              </Link>
              .
            </HelperText>

          </form>
        </div>

        {/* Right side - Welcome Image */}
        <div className="hidden sm:block w-1/2">
          <img
            src={welcomeImage}
            alt="Welcome"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
