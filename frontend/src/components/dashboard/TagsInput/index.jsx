import { Badge, Label, TextInput } from "flowbite-react";
import { memo, useState } from "react";

const TagsInput = memo(
  ({ id, label, placeholder, requirements, setRequirements }) => {
    const [requirement, setRequirement] = useState("");

    const KeyDownHandler = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (requirement.trim() !== "") {
          setRequirements((prev) => [...prev, requirement]);
          setRequirement("");
        }
      }
    };

    const changeHandler = (e) => {
      setRequirement(e.target.value);
    };

    const clickHandler = (requirement) => {
      setRequirements((prev) => prev.filter((item) => item !== requirement));
    };

    return (
      <div>
        <div className="mb-2 block">
          <Label htmlFor={id}>{label}</Label>
        </div>
        <div className="p-2 border-1 border-gray-300 dark:border-gray-600 rounded-lg">
          {requirements.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {requirements.map((requirement) => (
                <Badge
                  key={requirement}
                  color="success"
                  onClick={() => clickHandler(requirement)}
                >
                  {requirement}
                </Badge>
              ))}
            </div>
          )}
          <TextInput
            id={id}
            sizing="md"
            placeholder={`Ajoutez ${placeholder} et appuyez sur Entrée`} 
            value={requirement}
            onChange={changeHandler}
            onKeyDown={KeyDownHandler}
          />
        </div>
      </div>
    );
  }
);

export default TagsInput;
