import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="absolute bottom-5 w-full text-center flex flex-row items-center justify-center">
            <Image
                src="/assets/images/bitnovo.png"
                alt="Pago exitoso"
                width={164}
                height={26}
                className="w-[164px] h-[26px]"
            />
            
            <div className="w-[26px] h-[1px] bg-[#C0CCDA] transform rotate-[-90deg] mx-2"></div>
            
            <p className="font-mulish font-bold text-[12px] leading-[18px] tracking-normal text-[#C0CCDA]">
                © {currentYear} Bitnovo. All rights reserved.
            </p>
        </footer>
    );
}
