/**
 * @file src/hooks/use-form/index.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ValidationSchema,
  type FormErrors,
  validateField,
  validateForm,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Tracks which fields have been blurred at least once */
export type TouchedFields<TValues> = Partial<Record<keyof TValues, boolean>>;

/** The object returned by `register()` — spread directly onto an input */
export interface FieldProps {
  value: string; // text / password / select
  name: string;
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  onBlur: React.FocusEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
}

export interface UseFormReturn<TValues extends Record<string, unknown>> {
  /** Current form values */
  values: TValues;
  /** Current validation errors (keyed by field name) */
  errors: FormErrors<TValues>;
  /** Which fields the user has interacted with */
  touched: TouchedFields<TValues>;
  /** True once any field value diverges from its initial value */
  isDirty: boolean;
  /** Returns props to spread onto any <input>, <select>, or <textarea> */
  register: (name: keyof TValues) => FieldProps;
  registerSelect: (name: keyof TValues) => {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
  };
  registerTags: (name: keyof TValues) => {
    name: string;
    value: string[];
    onChange: (tags: string[]) => void;
    onBlur: () => void;
  };
  registerDate: (name: keyof TValues) => {
    name: string;
    value: string;
    onChange: (date: string) => void;
    onBlur: () => void;
  };
  /** Returns props for a <input type="file"> */
  registerFile: (name: keyof TValues) => {
    name: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
  };
  /** Wraps your submit handler; validates first, prevents default */
  handleSubmit: (
    onValid: (values: TValues) => void | Promise<void>,
  ) => React.FormEventHandler<HTMLFormElement>;
  /** Manually reset the form to initial values */
  reset: (newValues?: Partial<TValues>) => void;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
}

export function useForm<TValues extends Record<string, unknown>>(
  schema: ValidationSchema<TValues>,
  initialValues: TValues,
): UseFormReturn<TValues> {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [touched, setTouched] = useState<TouchedFields<TValues>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valuesRef = useRef(values);

  // Keep a stable ref to initialValues so reset() doesn't need it in deps
  const initialValuesRef = useRef(initialValues);

  // -------------------------------------------------------------------------
  // Internal: revalidate a single field
  // -------------------------------------------------------------------------
  const revalidateField = useCallback(
    (name: keyof TValues, currentValues: TValues) => {
      const fieldRules = schema[name];
      if (!fieldRules) return;

      const error = validateField(
        currentValues[name],
        fieldRules,
        currentValues,
      );

      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }
        return next;
      });
    },
    [schema],
  );

  // -------------------------------------------------------------------------
  // onChange — updates value; revalidates only if the field has been touched
  // -------------------------------------------------------------------------
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      const key = name as keyof TValues;

      setValues((prev) => {
        const next = { ...prev, [key]: value as TValues[keyof TValues] };

        // Revalidate live once the field has ever been touched
        if (touched[key]) {
          revalidateField(key, next);
        }

        // Dirty check
        if (value !== String(initialValuesRef.current[key] ?? "")) {
          setIsDirty(true);
        }

        return next;
      });
    },
    [touched, revalidateField],
  );

  // -------------------------------------------------------------------------
  // onChange for file inputs — stores the FileList
  // -------------------------------------------------------------------------
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target;
      const key = name as keyof TValues;
      const fileList = files as unknown as TValues[keyof TValues];

      setValues((prev) => {
        const next = { ...prev, [key]: fileList };

        if (touched[key]) {
          revalidateField(key, next);
        }

        setIsDirty(true);
        return next;
      });
    },
    [touched, revalidateField],
  );

  // -------------------------------------------------------------------------
  // onBlur — marks the field as touched and triggers validation
  // -------------------------------------------------------------------------
  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const key = e.target.name as keyof TValues;

      setTouched((prev) => ({ ...prev, [key]: true }));

      revalidateField(key, valuesRef.current);

      // Validate with current values (captured via functional updater)
      /* setValues((currentValues) => {
        revalidateField(key, currentValues);
        return currentValues; // no state change, just side-effecting
      }); */
    },
    [revalidateField],
  );

  // -------------------------------------------------------------------------
  // register — returns props for text / password / select / textarea
  // -------------------------------------------------------------------------
  const register = useCallback(
    (name: keyof TValues): FieldProps => ({
      name: name as string,
      value: (values[name] as string) ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur],
  );

  const registerSelect = useCallback(
    (name: keyof TValues) => ({
      name: name as string,
      value: (values[name] as string) ?? "",

      onChange: (value: string) => {
        setValues((prev) => {
          const next = { ...prev, [name]: value as TValues[keyof TValues] };
          if (touched[name]) revalidateField(name, next);
          if (value !== String(initialValuesRef.current[name] ?? ""))
            setIsDirty(true);
          return next;
        });
      },

      onBlur: () => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        revalidateField(name, valuesRef.current);
      },
    }),
    [values, touched, revalidateField],
  );

  const registerTags = useCallback(
    (name: keyof TValues) => ({
      name: name as string,
      value: (values[name] as string[]) ?? [],

      onChange: (tags: string[]) => {
        setValues((prev) => {
          const next = { ...prev, [name]: tags as TValues[keyof TValues] };
          if (touched[name]) revalidateField(name, next);
          setIsDirty(true);
          return next;
        });
      },

      onBlur: () => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        revalidateField(name, valuesRef.current);
      },
    }),
    [values, touched, revalidateField],
  );

  const registerDate = useCallback(
    (name: keyof TValues) => ({
      name: name as string,
      value: (values[name] as string) ?? "",

      onChange: (date: string) => {
        setTouched((t) => ({ ...t, [name]: true }));
        setValues((prev) => {
          const next = { ...prev, [name]: date as TValues[keyof TValues] };
          revalidateField(name, next);
          if (date !== String(initialValuesRef.current[name] ?? ""))
            setIsDirty(true);
          return next;
        });
      },

      onBlur: () => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        revalidateField(name, valuesRef.current);
      },
    }),
    [values, revalidateField],
  );

  // -------------------------------------------------------------------------
  // registerFile — returns props for <input type="file">
  // -------------------------------------------------------------------------
  const registerFile = useCallback(
    (name: keyof TValues) => ({
      name: name as string,
      onChange: handleFileChange,
      onBlur: handleBlur,
    }),
    [handleFileChange, handleBlur],
  );

  // -------------------------------------------------------------------------
  // handleSubmit — validates all fields, marks all as touched, calls onValid
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    (onValid: (values: TValues) => void | Promise<void>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Mark every schema field as touched so errors surface
        const allTouched = Object.keys(schema).reduce<TouchedFields<TValues>>(
          (acc, key) => ({ ...acc, [key]: true }),
          {},
        );
        setTouched(allTouched);

        // Full form validation
        const formErrors = validateForm(values, schema);
        setErrors(formErrors);

        const hasErrors = Object.keys(formErrors).length > 0;
        if (hasErrors) return;

        setIsSubmitting(true);
        try {
          await onValid(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, schema],
  );

  // -------------------------------------------------------------------------
  // reset
  // -------------------------------------------------------------------------
  const reset = useCallback((newValues?: Partial<TValues>) => {
    setValues(() => {
      // If overrides are passed, merge them with the initial values
      if (newValues) {
        return { ...initialValuesRef.current, ...newValues } as TValues;
      }
      // Otherwise, just reset to the original initial values
      return initialValuesRef.current;
    });
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  return {
    values,
    errors,
    touched,
    isDirty,
    register,
    registerFile,
    handleSubmit,
    reset,
    isSubmitting,
    registerSelect,
    registerTags,
    registerDate,
  };
}
