import {
  Alert,
  Button,
  HelperText,
  Label,
  Spinner,
  TextInput,
} from "flowbite-react";
import { Loading } from "../../../components/feedback";
import useResetPassword from "./useResetPassword";

const ResetPassword = () => {
  const { register, handleSubmit, onSubmit, state, errors, isSubmitting } =
    useResetPassword();

  return (
    <Loading loading={state.loading} error={state.error}>
      <section className="py-8 px-2 sm:px-4">
        <div className="flex justify-center">
          {state.isValid ? (
            <form
              className="w-full sm:w-[412px] flex flex-col gap-4"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="password1"
                    color={errors.password && "failure"}
                  >
                    Nouveau mot de passe
                  </Label>
                </div>
                <TextInput
                  id="password1"
                  type="password"
                  sizing="md"
                  {...register("password")}
                  color={errors.password && "failure"}
                />
                {errors.password && (
                  <HelperText color={errors.password && "failure"}>
                    <span className="font-medium">Oops!</span>{" "}
                    {errors.password.message}
                  </HelperText>
                )}
              </div>
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
                      aria-label="Submiting To Reset Password..."
                    />
                    Chargement...
                  </>
                ) : (
                  "Soumettre"
                )}
              </Button>
            </form>
          ) : (
            <Alert color={"info"}>Invalid Link!!!</Alert>
          )}
        </div>
      </section>
    </Loading>
  );
};

export default ResetPassword;
