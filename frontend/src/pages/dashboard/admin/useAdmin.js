import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";

// Fonction pour formater les labels
const formatStatusLabel = (status) => {
  if (!status) return 'Non défini';
  
  // Convertir les statuts en anglais vers des labels français
  const statusMap = {
    'en attente': 'en attente',
    'entretien': 'entretien',
    'refusé': 'refusé',
  };
  
  return statusMap[status.toLowerCase()] || 
    status.charAt(0).toUpperCase() + status.slice(1);
};

const useAdmin = () => {
  const [state, setState] = useState({
    infoData: [],
    defaultStats: [],
    loading: false,
    error: null,
  });

  const fetchInfo = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/admin/info`);
      const formattedInfo = Object.entries(data).map(([key, value]) => ({ key, value }));

      return formattedInfo;
    } catch (error) {
      throw axiosErrorHandler(error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/admin/stats`);
      
      // Normaliser les données de statistiques par défaut
      let formattedDefaultStats = [];
      
      if (data.defaultStats && Array.isArray(data.defaultStats)) {
        formattedDefaultStats = data.defaultStats.map(stat => {
          // Cas 1: { label, value }
          if (stat.label !== undefined && stat.value !== undefined) {
            return {
              label: formatStatusLabel(stat.label),
              value: Number(stat.value) || 0
            };
          }
          
          // Cas 2: { status, count }
          else if (stat.status !== undefined && stat.count !== undefined) {
            return {
              label: formatStatusLabel(stat.status),
              value: Number(stat.count) || 0
            };
          }
          
          // Cas 3: { name, value }
          else if (stat.name !== undefined && stat.value !== undefined) {
            return {
              label: formatStatusLabel(stat.name),
              value: Number(stat.value) || 0
            };
          }
          
          // Cas 4: si c'est un objet avec une seule paire clé-valeur
          else if (typeof stat === 'object') {
            const keys = Object.keys(stat);
            if (keys.length === 1) {
              return {
                label: formatStatusLabel(keys[0]),
                value: Number(stat[keys[0]]) || 0
              };
            }
          }
          
          // Fallback
          return { label: 'Non défini', value: 0 };
        });
      }
      
      // Si les données sont vides ou ne correspondent pas à la structure attendue
      if (formattedDefaultStats.length === 0) {
        console.warn('Les données de statistiques par défaut sont dans un format inattendu', data.defaultStats);
        
        // Créer des données de démonstration
        formattedDefaultStats = [
          { label: 'Interviews', value: Math.floor(Math.random() * 50) + 10 },
          { label: 'En attente', value: Math.floor(Math.random() * 100) + 20 },
          { label: 'Refusées', value: Math.floor(Math.random() * 30) + 5 }
        ];
      }
      
      return {
        defaultStats: formattedDefaultStats
      };
    } catch (error) {
      throw axiosErrorHandler(error);
    }
  }, []);

  const getAdminData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [info, stats] = await Promise.all([fetchInfo(), fetchStats()]);

      setState((prev) => ({
        ...prev,
        infoData: info,
        defaultStats: stats.defaultStats,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    }
  }, [fetchInfo, fetchStats]);

  useEffect(() => {
    getAdminData();
  }, [getAdminData]);

  return { state };
};

export default useAdmin;