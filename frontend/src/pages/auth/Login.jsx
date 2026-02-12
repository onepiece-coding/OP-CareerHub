import { useState } from "react";
import {
  Button,
  HelperText,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link, useSearchParams } from "react-router-dom";
import useAuthForm from "./useAuthForm";
import welcomeImage from "./image1.jpeg"; // Image importée

const Login = () => {
  const {
    register,
    handleSubmit,
    onSubmit,
    handlePasswordVisibility,
    errors,
    loading,
    passwordVisibility,
  } = useAuthForm("login");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full sm:w-[800px] flex rounded-lg shadow-lg overflow-hidden">
        {/* Left side - Login Form */}
        <div className="bg-white p-8 w-full sm:w-1/2 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6">Login</h2>

          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" color={errors.email && "failure"}>
                  Your email
                </Label>
              </div>
              <div className="relative">
                <TextInput
                  id="email"
                  type="email"
                  sizing="md"
                  {...register("email")}
                  color={errors.email && "failure"}
                  icon={() => (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  )}
                />
              </div>
              {errors.email && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.email.message}
                </HelperText>
              )}
            </div>

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
                  icon={() => (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                  )}
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

            <Button type="submit" className="cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    size="sm"
                    color="info"
                    className="me-1"
                    aria-label="Logging in..."
                  />
                  Chargement...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <HelperText className="mt-3 flex justify-between items-center">
              <Link
                to={"/register"}
                className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
              >
                S'inscrire
              </Link>
              <Link
                to={"/forgot-password"}
                className="ml-1 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
              >
                Réinitialiser le mot de passe
              </Link>
            </HelperText>
          </form>
        </div>

        {/* Right side - Image Full */}
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

export default Login;
