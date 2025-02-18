export const useFormatDate = () => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Fecha inválida'
        : date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).replace(',', '');
    };
  
    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Hora inválida'
        : date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
  
    return { formatDate, formatTime };
  };
  