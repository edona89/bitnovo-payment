import api from "../services/services.js";

export const fetchCurrencies = async (setCurrencies, setSelectedCurrency) => {
    try {
        const response = await api.get("/currencies");
        setCurrencies(response.data);

        if (response.data.length > 0) {
            setSelectedCurrency(response.data[0]);
        }

    } catch (error) {
        console.error("Error al obtener criptomonedas:", error);
    }
};