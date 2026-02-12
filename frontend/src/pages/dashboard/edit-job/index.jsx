import {
  Button,
  Select,
  Label,
  TextInput,
  Datepicker,
  HelperText,
  Textarea,
  Spinner,
} from "flowbite-react";
import {
  HiBriefcase,
  HiBuildingOffice2,
  HiMapPin,
  HiChartBar,
  HiClock,
  HiCurrencyDollar,
  HiEnvelope,
  HiPencilSquare,
  HiUserGroup,
  HiClipboardDocumentList,
} from "react-icons/hi2";
import { Loading } from "../../../components/feedback";
import { useParams } from "react-router-dom";
import { TagsInput } from "../../../components/dashboard";
import useEditJob from "./useEditJob";

const labelIconStyle = "inline-block text-orange-500 me-1";

const EditJob = () => {
  const { id: jobId } = useParams();

  const {
    loading,
    error,
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    deadline,
    setDeadline,
    skills,
    setSkills,
    facilities,
    setFacilities,
  } = useEditJob(jobId);

  return (
    <Loading loading={loading} error={error}>
      <section className="min-h-screen py-6 px-4 bg-gray-50">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md shadow-black/60 border border-gray-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="position" color={errors.position && "failure"}>
                <HiBriefcase className={labelIconStyle} />
                Position
              </Label>
              <TextInput
                id="position"
                sizing="md"
                placeholder="Job Position"
                {...register("position")}
                color={errors.position && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.position && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.position.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="company" color={errors.company && "failure"}>
                <HiBuildingOffice2 className={labelIconStyle} />
                Entreprise
              </Label>
              <TextInput
                id="company"
                sizing="md"
                placeholder="Nom de l'entreprise"
                {...register("company")}
                color={errors.company && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.company && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.company.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobLocation" color={errors.jobLocation && "failure"}>
                <HiMapPin className={labelIconStyle} />
                Emplacement
              </Label>
              <TextInput
                id="jobLocation"
                sizing="md"
                placeholder="Job Location"
                {...register("jobLocation")}
                color={errors.jobLocation && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.jobLocation && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobLocation.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobStatus" color={errors.jobStatus && "failure"}>
                <HiChartBar className={labelIconStyle} />
                Statut de l'emploi
              </Label>
              <Select
                id="jobStatus"
                sizing="md"
                {...register("jobStatus")}
                color={errors.jobStatus && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              >
                <option value="">Sélectionnez un statut</option>
                <option value="en attente">En attente</option>
                <option value="entretien">Entretien</option>
                <option value="refusé">Refusé</option>
              </Select>
              {errors.jobStatus && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobStatus.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobType" color={errors.jobType && "failure"}>
                <HiClipboardDocumentList className={labelIconStyle} />
                Type d'emploi
              </Label>
              <Select
                id="jobType"
                sizing="md"
                {...register("jobType")}
                color={errors.jobType && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              >
                <option value="">Sélectionnez un type</option>
                <option value="à temps plein">À temps plein</option>
                <option value="à temps partiel">À temps partiel</option>
                <option value="stage">Stage</option>
              </Select>
              {errors.jobType && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobType.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobVacancy" color={errors.jobVacancy && "failure"}>
                <HiUserGroup className={labelIconStyle} />
                Les offres
              </Label>
              <TextInput
                id="jobVacancy"
                sizing="md"
                placeholder="Nombre de postes"
                {...register("jobVacancy")}
                color={errors.jobVacancy && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.jobVacancy && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobVacancy.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobSalary" color={errors.jobSalary && "failure"}>
                <HiCurrencyDollar className={labelIconStyle} />
                Salaire
              </Label>
              <TextInput
                id="jobSalary"
                sizing="md"
                placeholder="Salaire proposé"
                {...register("jobSalary")}
                color={errors.jobSalary && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.jobSalary && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobSalary.message}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="jobDeadline">
                <HiClock className={labelIconStyle} />
                Date limite
              </Label>
              <Datepicker
                id="jobDeadline"
                sizing="md"
                value={deadline}
                onChange={(date) => setDeadline(date)}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
            </div>

            <div>
              <Label htmlFor="jobContact" color={errors.jobContact && "failure"}>
                <HiEnvelope className={labelIconStyle} />
                Courriel de contact
              </Label>
              <TextInput
                type="email"
                id="jobContact"
                sizing="md"
                placeholder="Email"
                {...register("jobContact")}
                color={errors.jobContact && "failure"}
                className="hover:border-orange-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
              />
              {errors.jobContact && (
                <HelperText color="failure">
                  <span className="font-medium">Oops!</span> {errors.jobContact.message}
                </HelperText>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 max-md:grid-cols-1 gap-6">
            <TagsInput
              id="jobSkills"
              label="Compétences professionnelles"
              placeholder="Compétence"
              requirements={skills}
              setRequirements={setSkills}
            />
            <TagsInput
              id="jobFacilities"
              label="Installations d'emploi"
              placeholder="Avantage"
              requirements={facilities}
              setRequirements={setFacilities}
            />
          </div>

          <div className="mt-6">
            <Label htmlFor="jobDescription" color={errors.jobDescription && "failure"}>
              <HiPencilSquare className={labelIconStyle} />
              Description
            </Label>
            <Textarea
              id="jobDescription"
              sizing="md"
              rows={4}
              placeholder="Décrivez le poste"
              {...register("jobDescription")}
              color={errors.jobDescription && "failure"}
              className="hover:border-blue-500 focus:ring-2 focus:ring-orange-500 font-medium w-full"
            />
            {errors.jobDescription && (
              <HelperText color="failure">
                <span className="font-medium">Oops!</span> {errors.jobDescription.message}
              </HelperText>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              type="button"
              className="hover:bg-orange-400 focus:ring-4 focus:ring-orange-100"
              onClick={() => window.history.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="hover:bg-orange-400 focus:ring-4 focus:ring-orange-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="info" className="me-1" />
                  Modification...
                </>
              ) : (
                "Modifier l'emploi"
              )}
            </Button>
          </div>
        </form>
      </section>
    </Loading>
  );
};

export default EditJob;
