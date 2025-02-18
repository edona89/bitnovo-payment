import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchCurrencies } from "../../app/hooks/useCurrencies";
import { createPayment } from "../../app/hooks/usePayments";
import "./../../app/styles/globals.css";
import Image from "next/image";

interface Currency {
    symbol: string;
    name: string;
    image: string;
    min_amount: string;
    max_amount: string;
}

export default function Index() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [amount, setAmount] = useState<string>("");
    const [concept, setConcept] = useState<string>("");
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [currencySelectedManually, setCurrencySelectedManually] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrencies(setCurrencies, setSelectedCurrency);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        value = value.replace(/[^0-9,]/g, "");

        setAmount(value);
    };

    const handleBlur = () => {
        if (amount) {
            const formattedAmount = parseFloat(amount.replace(",", "."))
                .toFixed(2)
                .replace(".", ",");

            setAmount(formattedAmount);
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 flex justify-center items-center">
                    <ClipLoader color="#3498db" size={50} />
                </div>
            )}
            <div className="container-container-payment text-center">
                <h1 className="container-title-payment">Crear Pago</h1>
                <div className="container-container-payment-form">
                    <div className="mb-4">
                        <label htmlFor="amount" className="label-custom">Importe a pagar</label>
                        <input
                            type="text"
                            id="amount"
                            placeholder="Añade importe a pagar"
                            value={amount}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-custom"
                        />
                        {errorMessage && (
                            <p className="text-red-500 text-sm mt-2 text-left">{errorMessage}</p>
                        )}
                    </div>
                    <div className="mb-4" style={{ position: "relative", marginTop: "10px" }}>
                        <label className="label-custom" style={{ display: "flex" }}>Seleccionar moneda
                            <Image
                                src="/assets/images/infotool.png"
                                alt="Pago exitoso"
                                width={14}
                                height={14}
                                className="w-[14px] h-[14px]"
                                style={{ marginTop: '3px', marginLeft: '4px' }}
                            />
                        </label>
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                            }}
                            className="select-custom"
                        >
                            {selectedCurrency ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Image
                                        src={selectedCurrency.image}
                                        alt={selectedCurrency.symbol}
                                        width={24}
                                        height={24}
                                        style={{ marginRight: "8px" }}
                                    />
                                    {selectedCurrency.name} {selectedCurrency.symbol}
                                </div>
                            ) : (
                                "Seleccionar moneda"
                            )}
                            <Image
                                src="/assets/images/arrow-down.png"
                                alt="Pago exitoso"
                                width={16}
                                height={16}
                                className="w-[16px] h-[16px]"
                            />
                        </div>

                        {isOpen && (
                            <div className="fixed top-0 left-0 w-full bg-white z-10 h-[533px] overflow-y-auto rounded-xl shadow-[0px_4.28px_8.55px_0px_#60617029]" style={{ padding: "24px" }}>
                                <div className="mb-2" style={{ padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="seleccionar-criptomonedas">Seleccionar criptomoneda</span>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "18px",
                                        }}
                                    >
                                        <Image
                                            src="/assets/images/add.png"
                                            alt="Pago exitoso"
                                            width={22}
                                            height={22}
                                            className="w-[22px] h-[22px]"
                                        />
                                    </button>
                                </div>

                                <div className="relative">
                                    <Image
                                        src="/assets/images/search-normal.png"
                                        alt="Pago exitoso"
                                        width={20}
                                        height={20}
                                        className="absolute left-2 top-1/3 transform -translate-y-1/2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Buscar"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            input.select();
                                        }}
                                        className="pl-8 input-custom"
                                        style={{
                                            width: "100%",
                                            marginBottom: "19px"
                                        }}
                                    />
                                </div>
                                <ul style={{ listStyle: "none", padding: "0", margin: "0" }}>
                                    {currencies
                                        .filter((currency) => currency.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((currency) => (
                                            <li
                                                key={currency.symbol}
                                                onClick={() => {
                                                    setSelectedCurrency(currency);
                                                    setCurrencySelectedManually(true);
                                                    setIsOpen(false);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    padding: "10px",
                                                    cursor: "pointer",
                                                    justifyContent: "space-between",
                                                    backgroundColor: selectedCurrency?.symbol === currency.symbol ? '#EFF2F7' : 'transparent',
                                                    color: selectedCurrency?.symbol === currency.symbol ? 'white' : 'inherit',
                                                    width: "100%",
                                                    marginBottom: "19px",
                                                    borderRadius: "6px"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <Image
                                                        src={currency.image}
                                                        alt={currency.symbol}
                                                        width={32}
                                                        height={32}
                                                        style={{ marginRight: "8px" }}
                                                    />
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                        <span style={{ marginBottom: "2px", color: "#002859", fontSize: "14px", fontWeight: "700" }}>{currency.name}</span>
                                                        <span style={{ color: "#647184", fontSize: "12px", fontWeight: "400" }}>{currency.symbol}</span>
                                                    </div>
                                                </div>

                                                {selectedCurrency?.symbol === currency.symbol ? (
                                                    <Image
                                                        src="/assets/images/tick-circle-bk.png"
                                                        alt="Pago exitoso"
                                                        width={16}
                                                        height={16}
                                                        className="w-[16px] h-[16px]"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="/assets/images/arrow-right.png"
                                                        alt="Pago exitoso"
                                                        width={16}
                                                        height={16}
                                                        className="w-[16px] h-[16px]"
                                                        style={{ color: "#647184" }}
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    {currencies.filter((currency) => currency.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                        <li style={{ padding: "10px", textAlign: "center", color: "#647184" }}>
                                            No hay resultados
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                    </div>
                    <div className="mb-4" style={{ position: "relative", marginTop: "10px" }}>
                        <label className="label-custom">Concepto</label>
                        <input
                            type="text"
                            id="concept"
                            placeholder="Añade descripción del pago"
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            className="input-custom"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                    </div>
                </div>
                <button
                    onClick={() => createPayment(amount, concept, selectedCurrency, currencySelectedManually, setIsLoading, router, setErrorMessage)}
                    disabled={!amount || !concept || !currencySelectedManually || isLoading}
                    className={`container-button mt-6 w-full ${!amount || !concept || !currencySelectedManually || isLoading ? 'bg-[#C6DFFE]' : 'bg-[#035AC5]'} text-white`}
                    style={{ cursor: !amount || !concept || !currencySelectedManually || isLoading ? 'not-allowed' : 'pointer' }}
                >
                    Continuar
                </button>

            </div>
        </div>
    );
}
