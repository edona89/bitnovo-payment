"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import "./../app/styles/globals.css";

export default function Success() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const redirectToHome = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/home");
    }, 1000);
  };

  return (
    <div>
      {isLoading && (
        <div className="loading-overlay">
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}
      <div className="container-container text-center">
        <div className="container-content">
          <div className="flex justify-center">
            <Image
              src="/assets/images/tick-circle.png"
              alt="Pago exitoso"
              width={80}
              height={80}
              className="w-[80px] h-[80px]"
            />
          </div>

          <h1 className="container-title">¡Pago completado!</h1>
          <p className="container-text">
            Lorem ipsum dolor sit amet consectetur. Laoreet blandit auctor et varius
            dolor elit facilisi enim. Nulla ut ut eu nunc.
          </p>
        </div>
        <button onClick={redirectToHome} className="container-button">
          Crear nuevo pago
        </button>
      </div>
    </div>
  );
}
