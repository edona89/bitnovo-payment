import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../app/services/services';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { ClipLoader } from 'react-spinners';
import { useFormatDate } from '../app/hooks/useFormatDate';
import useCopyToClipboard from '../app/hooks/useCopyToClipboard';
import Image from "next/image";
import "./../app/styles/globals.css";
import Footer from "./../app/components/Footer.js"

export default function Checkout() {
  const router = useRouter();
  const { identifier, amount, concept, selectedCurrency, currencyImage, paymentUri } = router.query;
  const { formatDate, formatTime } = useFormatDate();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [selectedOption, setSelectedOption] = useState('QR');
  const [addressQr, setAddressQr] = useState(null);


  useEffect(() => {
    const socket = new WebSocket(`wss://payments.pre-bnvo.com/ws/${identifier}`);
    socket.onopen = () => {
      console.log("Conexión WebSocket Abierta");
    };
    socket.onmessage = (event) => {
      if (event.data && event.data.startsWith("{") && event.data.endsWith("}")) {
        try {
          const data = JSON.parse(event.data);
          if (data.status) {
            setPaymentInfo(data);
            setStatus(data.status);

            if (data.status === 'CO' || data.status === 'AC') {
              router.push('/success');
            } else if (data.status === 'EX' || data.status === 'OC') {
              router.push('/failed');
            }
          }
        } catch (error) {
          console.error('Error al parsear los datos del WebSocket:', error);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };

    return () => {
      socket.close();
    };
  }, [identifier, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsMetaMaskInstalled(true);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !identifier) return;
  
    const fetchPaymentInfo = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/info/${identifier}`);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        
        setPaymentInfo(data);
  
        setLoading(false);
      } catch (error) {
        setError(`Error al obtener la información: ${error.response?.status} - ${error.response?.data?.message || 'Desconocido'}`);
        setLoading(false);
      }
    };
  
    fetchPaymentInfo();
  }, [router.isReady, identifier]);
  
  useEffect(() => {
    if (paymentUri) {
      const addressQrValue = paymentUri.split(':')[1]?.split('?')[0];
      if (addressQrValue) {
        setAddressQr(addressQrValue);
      }
    }
  }, [paymentUri]);

  useEffect(() => {
    if (paymentInfo?.expired_time) {
      const expirationTime = new Date(paymentInfo.expired_time).getTime();
      if (Date.now() > expirationTime) {
        router.push('/failed');
      }
    }
  }, [paymentInfo]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setSelectedOption('Web3');
      } catch (error) {
        console.error('Error con MetaMask:', error);
        alert('Error al conectar con MetaMask.');
      }
    } else {
      alert('Instala MetaMask para continuar.');
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 flex justify-center items-center">
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}

      <div className="flex justify-center items-center w-full h-screen">
        <div className="flex justify-between w-[1198px] gap-[32px]">
          <div className="w-[48%]">
            <h1 className="font-[Mulish] font-bold text-[22px] leading-[25px] tracking-[0%] text-[#002859] mb-[20px]">
              Resumen del pedido
            </h1>
            <div className="w-[583px] h-[370px] rounded-[16px] p-[32px] gap-[10px] bg-[#F9FAFC] flex flex-col justify-between">
              <div className="w-[519px] h-[306px] gap-[31px] flex flex-col justify-between">

                <div className="flex justify-between items-center h-[44px] border-b-[1px] border-[#C0CCDA] pb-[10px]">
                  <p className="font-mulish font-bold text-[18px] leading-[22px] tracking-normal text-[#002859] text-center">
                    Importe:
                  </p>
                  <p className="font-mulish font-bold text-[18px] leading-[22px] tracking-normal text-right text-[#002859] pr-[20px]">
                    {parseFloat(amount).toFixed(2).replace('.', ',')} {paymentInfo?.fiat}
                  </p>
                </div>

                <div className="flex justify-between items-center h-[53px] gap-[21px] border-b-[1px] border-[#C0CCDA] pb-[10px]">
                  <p className="font-mulish font-bold text-[16px] leading-[20px] tracking-normal text-[#002859] text-center">
                    Moneda Seleccionada:
                  </p>
                  <p className="flex items-center justify-between font-mulish font-semibold text-[16px] leading-[20px] tracking-normal text-right text-[#002859] pr-[20px]">
                    <Image
                      src={currencyImage}
                      alt="Imagen no disponible"
                      className="w-[30px] h-[30px] ml-[10px]"
                      width={30}
                      height={30}
                    />
                    {selectedCurrency}
                  </p>
                </div>

                <div className="flex flex-col justify-between items-start h-[75px] gap-[31px]">
                  <div className="flex justify-between items-center w-full">
                    <p className="font-mulish font-bold text-[16px] leading-[20px] tracking-normal text-[#002859] text-center">
                      Comercio:
                    </p>
                    <p className="flex justify-between font-mulish font-semibold text-[16px] leading-[20px] tracking-normal text-right text-[#002859]">
                      <Image
                        src="/assets/images/verify.png"
                        alt="Pago exitoso"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px]"
                      />
                      {paymentInfo?.merchant_device}
                    </p>
                  </div>

                  <div className="flex justify-between items-center w-full border-b-[1px] border-[#C0CCDA] pb-[10px]">
                    <p className="font-mulish font-bold text-[16px] leading-[20px] tracking-normal text-[#002859] text-center">
                      Fecha:
                    </p>
                    <p className="font-mulish font-semibold text-[16px] leading-[20px] tracking-normal text-right text-[#002859]">
                      {paymentInfo?.created_at ? formatDate(paymentInfo.created_at) : 'Cargando...'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center h-[41px]">
                  <p className="font-mulish font-bold text-[16px] leading-[20px] tracking-normal text-[#002859] text-center">
                    Concepto:
                  </p>
                  <p className="font-mulish font-semibold text-[16px] leading-[20px] tracking-normal text-right text-[#002859] pr-[20px]">
                    {concept}
                  </p>
                </div>
              </div>
            </div>

          </div>
          <div className="w-[48%]">
            <h1 className="font-[Mulish] font-bold text-[20px] leading-[25px] tracking-[0%] text-[#002859] mb-[20px]">
              Realiza el pago
            </h1>

            <div className="flex flex-col justify-between w-[583px] h-[530px] rounded-[16px] border-[1px] border-[#F5F5F5] p-[32px] bg-[#FFFFFF] shadow-[0px_0px_4.39px_0px_#00000005,_0px_0px_27px_0px_#0000000A]">
              <p className="flex items-center justify-center space-x-2">
                <Image
                  src="/assets/images/timer.png"
                  alt="Pago exitoso"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
                <span className="font-mulish font-semibold text-[12px] leading-[20px] tracking-[0%] text-[#002859] text-center">
                  {paymentInfo?.created_at ? formatTime(paymentInfo.created_at) : 'Cargando...'}
                </span>
              </p>

              <div className="flex justify-center space-x-[4px]">
                <button
                  onClick={() => setSelectedOption('QR')}
                  className={`px-[20px] py-[10px] rounded-[100px] cursor-pointer ${selectedOption === 'QR' ? 'bg-[#035AC5] text-white' : 'bg-[#F9FAFC] text-black'} font-mulish font-normal text-[16px] leading-[20px] tracking-[0%] text-center`}
                  style={{ height: '32px', width: '98px', paddingTop: '6px', paddingRight: '12px', paddingBottom: '6px', paddingLeft: '12px' }}
                >
                  Smart QR
                </button>

                <button
                  onClick={connectWallet}
                  disabled={!isMetaMaskInstalled}
                  className={`px-[20px] py-[10px] rounded-[100px] cursor-${isMetaMaskInstalled ? 'pointer' : 'not-allowed'} ${selectedOption !== 'QR' ? 'bg-[#035AC5] text-white' : 'bg-[#F9FAFC] text-black'} font-mulish font-normal text-[16px] leading-[20px] tracking-[0%] text-center`}
                  style={{ height: '32px', width: '98px', paddingTop: '6px', paddingRight: '12px', paddingBottom: '6px', paddingLeft: '12px' }}
                >
                  Web3
                </button>
              </div>

              {selectedOption === 'QR' && addressQr && (
                <div className="flex justify-center items-center mt-[24px] gap-[24px]">
                  <div
                    className="w-[193px] h-[193px] rounded-[12px] border-[1px] border-[#E5E9F2] overflow-hidden"
                  >
                    <QRCodeSVG value={addressQr} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {selectedOption === 'Web3' && (
                <div className="flex justify-center items-center mt-[24px] gap-[24px]">
                  <div
                    className="w-[193px] h-[193px] rounded-[12px] border-[1px] border-[#E5E9F2] overflow-hidden"
                  >
                    <Image
                      src="https://metamask.io/images/metamask-logo.png"
                      alt="Imagen no disponible"
                      className="w-full h-full object-cover"
                      width={193}
                      height={193}
                    />
                    <p>{walletAddress}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-center items-center text-[#002859] font-Mulish text-[20px] leading-[25px] tracking-[0%] text-center mb-[15px]">
                  <span className="font-normal text-[14px] leading-[20px] tracking-[1%] mr-2">{`Enviar `}</span>
                  <span className="font-semibold text-[20px] leading-[20px] tracking-[1%]">
                    {`${paymentInfo?.crypto_amount} ${paymentInfo?.currency_id}`}
                  </span>
                  <Image
                    src="/assets/images/copy.png"
                    alt="Pago exitoso"
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    onClick={() => copyToClipboard(`${paymentInfo?.crypto_amount} ${paymentInfo?.currency_id}`)}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                  />
                </div>

                <div className="flex justify-center items-center text-[#002859] font-Mulish text-[20px] leading-[25px] tracking-[0%] text-center mb-[15px]">
                  <span className="text-[14px] leading-[20px] tracking-[1%]">
                    {paymentInfo?.address}
                  </span>
                  <Image
                    src="/assets/images/copy.png"
                    alt="Pago exitoso"
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    onClick={() => copyToClipboard(paymentInfo?.address)}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                  />
                </div>

                <div className="flex justify-center items-center text-[#002859] font-Mulish text-[20px] leading-[25px] tracking-[0%] text-center mb-[15px]">
                  <Image
                    src="/assets/images/warning.svg"
                    alt="Pago exitoso"
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px]"
                    style={{ marginRight: '10px' }}
                  />
                  <span className="font-normal text-[12px] leading-[20px] tracking-[1%] mr-2">
                    {`Etiqueta de destino: `}
                  </span>
                  <span className="font-semibold text-[12px] leading-[20px] tracking-[1%]">
                    {paymentInfo?.tag_memo}
                  </span>
                  <Image
                    src="/assets/images/copy.png"
                    alt="Pago exitoso"
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    onClick={() => copyToClipboard(paymentInfo?.tag_memo)}
                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                  />
                </div>
                {isCopied && (
                  <span className="text-green-500 text-xs mt-2 flex justify-center items-center">
                    ¡Texto copiado al portapapeles!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
