/**
 * @file src/components/common/search/index.tsx
 */

import { rules, type ValidationSchema } from "@/lib/validation";
import { FormField } from "@/components/forms";
import { Button } from "@/components/ui";
import { useForm } from "@/hooks";

import styles from "./styles.module.css";

export type searchValues = {
  search: string;
};

const searchSchema: ValidationSchema<searchValues> = {
  search: [
    rules.optional(),
    rules.minLength(2, "Username too short"),
    rules.maxLength(100, "Username too long"),
  ],
};

interface SearchProps {
  handleSearchChange: (newText: string) => void;
  initialValue: string;
  label: string;
}

const Search = ({ handleSearchChange, initialValue, label }: SearchProps) => {
  const { errors, touched, register, handleSubmit, reset } =
    useForm<searchValues>(searchSchema, {
      search: initialValue,
    });

  const onSubmit = async (data: searchValues) => {
    handleSearchChange(data.search || "");
  };

  const onClear = () => {
    reset({ search: "" });
    handleSearchChange("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
      <div className={styles.row}>
        <FormField
          placeholder={"Filter based on username"}
          touched={touched.search}
          {...register("search")}
          error={errors.search}
          autoComplete="off"
          label={label}
          type="text"
        />

        <div className={styles["action-btns"]}>
          <Button variant="slate" onClick={onClear} type="button">
            Cancel
          </Button>
          <Button type="submit">Search</Button>
        </div>
      </div>
    </form>
  );
};

export default Search;
