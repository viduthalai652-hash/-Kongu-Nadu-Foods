import { Link } from "@tanstack/react-router";
import logo from "../assets/logo.png";
import packIdly from "../assets/pack-idly-batter.png";
import packDosa from "../assets/pack-dosa-batter.png";
import bgImage from "../assets/farm.jpg";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-auto">
      {/* Background Image with Light Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.07]"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <div className="relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img src={logo} alt="Kongu Nadu Fresh Foods" className="h-14 w-auto" />
            <p className="mt-4 text-sm text-brand-brown/80 max-w-sm font-medium">
              Pure tradition, pure nutrition — batter delivered Monday to Saturday, 4 PM – 7 PM across Coimbatore.
            </p>
            <div className="mt-4 flex gap-3">
              <img
                src={packIdly}
                alt="Kongunadu idly batter pack"
                loading="lazy"
                className="h-20 w-auto object-contain drop-shadow-sm"
              />
              <img
                src={packDosa}
                alt="Kongunadu idly dosa batter pack"
                loading="lazy"
                className="h-20 w-auto object-contain drop-shadow-sm"
              />
            </div>
          </div>
          <div>
            <p className="font-semibold text-brand-green-dark mb-3">Shop</p>
            <ul className="space-y-2 text-sm text-brand-brown/70 font-medium">
              <li>
                <Link to="/" hash="batter" className="hover:text-brand-green">
                  Fresh batter
                </Link>
              </li>
              <li>
                <Link to="/" hash="rice" className="hover:text-brand-green">
                  Traditional rice
                </Link>
              </li>
              <li>
                <Link to="/" hash="offer" className="hover:text-brand-green">
                  Millets
                </Link>
              </li>
              <li>
                <Link to="/" hash="offer" className="hover:text-brand-green">
                  Grocery & oils
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-brand-green-dark mb-3">Company</p>
            <ul className="space-y-2 text-sm text-brand-brown/70 font-medium">
              <li>
                <Link to="/about" className="hover:text-brand-green">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/about" hash="offer" className="hover:text-brand-green">
                  Campo offer
                </Link>
              </li>
              <li>
                <Link to="/about" hash="made" className="hover:text-brand-green">
                  How it's made
                </Link>
              </li>
              <li>
                <Link to="/about" hash="coverage" className="hover:text-brand-green">
                  Delivery coverage
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-brown/60 font-medium">
            <p>© {new Date().getFullYear()} Kongu Nadu Fresh Foods. All rights reserved.</p>
            <p>Made with 🌱 in Kongu Nadu, Tamil Nadu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
