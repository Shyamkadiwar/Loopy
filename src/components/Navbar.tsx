import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full bg-[#0a090f] border-b border-[#353539] py-4 px-8 flex justify-between items-center z-50 selection:bg-white selection:text-black">
            {/* Logo */}
            <div className="flex items-center space-x-3">
                <Image src="/images/LOOPY.png" alt="Loopy Logo" width={120} height={40} />
            </div>

            {/* Navbar Links */}
            <div className="hidden md:flex items-center space-x-10 text-gray-300 gap-14">
                <div className="relative group">
                    <Link href="#" className="font-semibold text-lg hover:text-white transition">Explore</Link>
                    <div className="absolute left-0 bottom-[-25px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
                <div className="relative group">
                    <Link href="#" className="font-semibold text-lg hover:text-white transition">Developers</Link>
                    <div className="absolute left-0 bottom-[-25px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
                <div className="relative group">
                    <Link href="#" className="font-semibold text-lg hover:text-white transition">Learn</Link>
                    <div className="absolute left-0 bottom-[-25px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
                <div className="relative group">
                    <Link href="#" className="font-semibold text-lg hover:text-white transition">Community</Link>
                    <div className="absolute left-0 bottom-[-25px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
                <div className="relative group">
                    <Link href="#" className="font-semibold text-lg hover:text-white transition">Pricing</Link>
                    <div className="absolute left-0 bottom-[-25px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
            </div>

            {/* Sign In & Sign Up */}
            <div className="flex items-center space-x-4">
                <Link href="/signin">
                    <button className="px-4 font-bold py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition">
                        Sign In
                    </button>
                </Link>
                <Link href="/signup">
                    <button className="px-4 py-2 font-bold text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition">
                        Sign Up
                    </button>
                </Link>
            </div>
        </nav>
    );
}
