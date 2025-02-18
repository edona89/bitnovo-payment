import api from "../services/services.js";

export const createPayment = async (
    amount,
    concept,
    selectedCurrency,
    currencySelectedManually,
    setIsLoading,
    router,
    setErrorMessage
) => {
    if (!amount || !concept || !selectedCurrency || !currencySelectedManually) {
        alert("Por favor, completa todos los campos");
        return;
    }

    const amountWithPoint = amount.replace(",", ".");

    if (isNaN(Number(amountWithPoint))) {
        alert("El monto debe ser un número válido");
        return;
    }

    const minAmount = parseFloat(selectedCurrency.min_amount);
    const maxAmount = parseFloat(selectedCurrency.max_amount);
    const amountValue = parseFloat(amountWithPoint);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    if (amountValue < minAmount || amountValue > maxAmount) {
        setErrorMessage(`El monto debe estar entre ${formatAmount(minAmount)} y ${formatAmount(maxAmount)} EUR`);
        return;
    }

    const deviceId = process.env.NEXT_PUBLIC_DEVICE_ID;

    try {
        setIsLoading(true);
        const response = await api.post(
            "/orders/",
            {
                expected_output_amount: amountValue,
                tag_memo: concept,
                input_currency: selectedCurrency.symbol,
            },
            {
                headers: { "X-Device-Id": deviceId },
            }
        );

        const { payment_uri, identifier } = response.data;

        if (payment_uri && identifier) {
            router.push(
                `/checkout?identifier=${identifier}&amount=${amount}&concept=${concept}&selectedCurrency=${selectedCurrency.symbol}&currencyImage=${encodeURIComponent(
                    selectedCurrency.image
                )}&paymentUri=${encodeURIComponent(payment_uri)}`
            );
        } else {
            alert("No se pudo obtener la información del pago.");
        }
    } catch (error) {
        console.error("Error al crear pago:", error.response?.data || error.message);
        alert(error.response?.data?.detail || "Ocurrió un error. Intenta nuevamente más tarde.");
    } finally {
        setIsLoading(false);
    }
};
