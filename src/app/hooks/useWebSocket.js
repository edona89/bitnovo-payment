import { useEffect } from 'react';

const useWebSocket = (identifier, router, setPaymentInfo) => {
  useEffect(() => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}${identifier}`);

    socket.onopen = () => {
      console.log("Conexión WebSocket Abierta");
    };

    socket.onmessage = (event) => {
      if (event.data && event.data.startsWith("{") && event.data.endsWith("}")) {
        try {
          const data = JSON.parse(event.data);
          if (data.status) {
            setPaymentInfo(data);

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
  }, [identifier, router, setPaymentInfo]); // Dependencias necesarias
};

export default useWebSocket;
