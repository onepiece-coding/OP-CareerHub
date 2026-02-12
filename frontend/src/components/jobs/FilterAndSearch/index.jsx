import { Select, TextInput } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useJobsContext } from "../../../hooks/useJobsContext";
import { useDebounce } from "../../../hooks/useDebounce";
import "./styles.css";

const FilterAndSearch = () => {
  const { filters, setFilters } = useJobsContext();
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  const handleFilterChange = useCallback(
    (name, value) => {
      console.log({ [name]: value });
      setFilters({ [name]: value });
    },
    [setFilters]
  );

  useEffect(() => {
    setFilters({ searchTerm: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <div
      className="w-full px-4 pt-20 pb-8 rounded-lg relative overflow-hidden" // pt-20 pour l'espace en haut
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "200px" // Hauteur minimale augmentée
      }}
    >
      {/* Darker overlay for better contrast */}
      <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
      
      {/* Content container */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center gap-6 mt-8"> {/* mt-8 pour espace supplémentaire */}
        {/* Enhanced search bar */}
        <div className="sm:max-w-2xl w-full">
          <TextInput
            type="text"
            rightIcon={IoSearchOutline}
            placeholder="Rechercher un emploi..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            required
            className="bg-white/90 hover:bg-white transition-all duration-300 rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
            theme={{
              field: {
                input: {
                  base: "w-full p-4 text-lg",
                }
              }
            }}
          />
        </div>

        {/* Enhanced filters row */}
        <div className="w-full flex items-center justify-center gap-4 flex-wrap">
          {[
            {
              name: "type",
              label: <span className="yellow-label">Type</span>,
              options: [
                { value: "", label: "Tous types" },
                { value: "à temps plein", label: "Temps plein" },
                { value: "à temps partiel", label: "Temps partiel" },
                { value: "stage", label: "Stage" },
              ],
            },
            {
              name: "status",
              label: <span className="blue-label">Statut</span>,
              options: [
                { value: "", label: "Tous statuts" },
                { value: "en attente", label: "En attente" },
                { value: "entretien", label: "Entretien" },
                { value: "refusé", label: "Refusé" },
              ],
            },
            {
              name: "sortBy",
              label:<span className="orange-label">Trier</span>,
              options: [
                { value: "", label: "Par défaut" },
                { value: "plus ancien", label: "Plus ancien" },
                { value: "a-z", label: "A-Z" },
                { value: "z-a", label: "Z-A" },
              ],
            },
          ].map((filter) => (
            <div key={filter.name} className="w-full sm:w-48">
              <Select
                addon={filter.label}
                value={filters[filter.name]}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="bg-white/90 hover:bg-white transition-all duration-300 rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-800"
                theme={{
                  select: {
                    field: {
                      select: {
                        base: "w-full p-3 text-md",
                      }
                    }
                  }
                }}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterAndSearch;


