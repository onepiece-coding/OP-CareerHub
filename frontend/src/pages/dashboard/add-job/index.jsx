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
import { TagsInput } from "../../../components/dashboard";
import {
  HiBriefcase,
  HiBuildingOffice2,
  HiMapPin,
  HiChartBar,
  HiClock,
  HiCurrencyDollar,
  HiEnvelope,
  HiPencilSquare,
} from "react-icons/hi2";
import useAddJob from "./useAddJob";

const labelIconStyle = "inline-block text-orange-500 me-1";

const AddJob = () => {
  const {
    register,
    onSubmit,
    handleSubmit,
    errors,
    isSubmitting,
    deadline,
    setDeadline,
    skills,
    setSkills,
    facilities,
    setFacilities,
  } = useAddJob();

  return (
    <section className="min-h-screen py-6 px-4 bg-gray-100">
      {/* Titre avec icône */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-2 text-3xl font-bold text-gray-700">
        <HiBriefcase className="text-blue-600 text-4xl" />
        <h2>Ajouter une nouvelle offre d’emploi</h2>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4">
          <div>
            <Label htmlFor="position" color={errors.position && "failure"}>
              <HiBriefcase className={labelIconStyle} />
              Position
            </Label>
            <TextInput
              id="position"
              placeholder="Poste"
              {...register("position")}
              color={errors.position && "failure"}
            />
            {errors.position && (
              <HelperText color="failure">{errors.position.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="company" color={errors.company && "failure"}>
              <HiBuildingOffice2 className={labelIconStyle} />
              Entreprise
            </Label>
            <TextInput
              id="company"
              placeholder="Nom de l'entreprise"
              {...register("company")}
              color={errors.company && "failure"}
            />
            {errors.company && (
              <HelperText color="failure">{errors.company.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobLocation" color={errors.jobLocation && "failure"}>
              <HiMapPin className={labelIconStyle} />
              Emplacement
            </Label>
            <TextInput
              id="jobLocation"
              placeholder="Lieu de travail"
              {...register("jobLocation")}
              color={errors.jobLocation && "failure"}
            />
            {errors.jobLocation && (
              <HelperText color="failure">{errors.jobLocation.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobStatus" color={errors.jobStatus && "failure"}>
              <HiChartBar className={labelIconStyle} />
              Statut de l'emploi
            </Label>
            <Select id="jobStatus" {...register("jobStatus")} color={errors.jobStatus && "failure"}>
              <option value="">Sélectionnez un statut de travail</option>
              <option value="en attente">En attente</option>
              <option value="entretien">Entretien</option>
              <option value="refusé">Refusé</option>
            </Select>
            {errors.jobStatus && (
              <HelperText color="failure">{errors.jobStatus.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobType" color={errors.jobType && "failure"}>
              <HiChartBar className={labelIconStyle} />
              Type d'emploi
            </Label>
            <Select id="jobType" {...register("jobType")} color={errors.jobType && "failure"}>
              <option value="">Sélectionnez un type de travail</option>
              <option value="à temps plein">À temps plein</option>
              <option value="à temps partiel">À temps partiel</option>
              <option value="stage">Stage</option>
            </Select>
            {errors.jobType && (
              <HelperText color="failure">{errors.jobType.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobVacancy" color={errors.jobVacancy && "failure"}>
              <HiClock className={labelIconStyle} />
              Les offres
            </Label>
            <TextInput
              id="jobVacancy"
              placeholder="Offre d'emploi"
              {...register("jobVacancy")}
              color={errors.jobVacancy && "failure"}
            />
            {errors.jobVacancy && (
              <HelperText color="failure">{errors.jobVacancy.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobSalary" color={errors.jobSalary && "failure"}>
              <HiCurrencyDollar className={labelIconStyle} />
              Salaire
            </Label>
            <TextInput
              id="jobSalary"
              placeholder="Salaire du travail"
              {...register("jobSalary")}
              color={errors.jobSalary && "failure"}
            />
            {errors.jobSalary && (
              <HelperText color="failure">{errors.jobSalary.message}</HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="jobDeadline">
              <HiClock className={labelIconStyle} />
              Date limite d'emploi
            </Label>
            <Datepicker
              id="jobDeadline"
              value={deadline}
              onChange={(date) => setDeadline(date)}
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
              placeholder="Courriel de contact"
              {...register("jobContact")}
              color={errors.jobContact && "failure"}
            />
            {errors.jobContact && (
              <HelperText color="failure">{errors.jobContact.message}</HelperText>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 max-md:grid-cols-1 gap-4">
          <TagsInput
            id="jobSkills"
            label="Compétences professionnelles"
            placeholder="skill"
            requirements={skills}
            setRequirements={setSkills}
          />
          <TagsInput
            id="jobFacilities"
            label="Installations d'emploi"
            placeholder="facility"
            requirements={facilities}
            setRequirements={setFacilities}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="jobDescription" color={errors.jobDescription && "failure"}>
            <HiPencilSquare className={labelIconStyle} />
            Description
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Description de l'emploi"
            {...register("jobDescription")}
            color={errors.jobDescription && "failure"}
            rows={4}
          />
          {errors.jobDescription && (
            <HelperText color="failure">{errors.jobDescription.message}</HelperText>
          )}
        </div>

        <Button
          type="submit"
          className="mt-6 w-full bg-blue-500 hover:bg-blue-700 text-white text-lg py-2 transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="me-2" />
              Chargement...
            </>
          ) : (
            "Ajouter un emploi"
          )}
        </Button>
      </form>
    </section>
  );
};

export default AddJob;
