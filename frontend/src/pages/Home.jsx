import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Star,
  Scissors,
  Sparkles,
  Coffee,
  UtensilsCrossed,
  ConciergeBell,
} from "lucide-react";
import ImmersiveViewer from "../components/ImmersiveViewer";
import AppShell from "../components/AppShell";
import { CONTACT, SITE } from "../data/bookingCatalog";

/**
 * Page HOME (connecté) — design fourni par le client.
 * ≠ Landing publique `/`.
 * Accessible via onglet Home → /home (session conservée).
 */

const espaces = [
  {
    id: "le137",
    nom: "Le 137",
    adresse: "16 Passage Lemoine, 75002 Paris",
    description:
      "Open space lumineux de 160m² au calme dans une cour intérieure parisienne. Idéal pour les coiffeurs indépendants.",
    superficie: "160 m²",
    postes: "17 postes",
    detail: "2 fauteuils barbier · 8 fauteuils premium · 7 fauteuils classique",
    image:
      "https://static.wixstatic.com/media/95a7b9_03317c6f11dc4ff7a8595d89cb0bbaa6~mv2.jpg/v1/fill/w_1200,h_800,al_c,q_85/PHOTO-2026-02-24-16-55-40.jpg",
  },
  {
    id: "le80",
    nom: "Le 80",
    adresse: "80 Rue de Cléry, 75002 Paris",
    description:
      "Appartement haussmannien de 140m² au 1er étage, ambiance chaleureuse et intimiste pour une clientèle exigeante.",
    superficie: "140 m²",
    postes: "17 postes",
    detail: "1 cabine esthétique · 16 fauteuils",
    image:
      "https://static.wixstatic.com/media/95a7b9_0301817b4f4b4691baf5844c25277884~mv2.png/v1/fill/w_1200,h_800,al_c,q_90/ChatGPT-Image-17-30-50.png",
  },
];

const atouts = [
  {
    icon: Scissors,
    label: "Facilité",
    desc: "Le coworking beauté permet de limiter les frais en partageant les charges et vous épargne les démarches administratives fastidieuses.",
    image:
      "https://static.wixstatic.com/media/95a7b9_b8eec91fed4141b08c50c37f5485a026~mv2.jpeg/v1/fill/w_600,h_600,al_c,q_85/WhatsApp-Image-2025-07-15.jpeg",
  },
  {
    icon: Sparkles,
    label: "Liberté",
    desc: "La location flexible allant de la demi-heure au mois, en passant par le jour et la semaine, permet de travailler selon sa convenance.",
    image:
      "https://static.wixstatic.com/media/95a7b9_24fa21e531164368a78907606651d8cd~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/PHOTO-2026-02-23-22-52-58.jpg",
  },
  {
    icon: Star,
    label: "Confort",
    desc: "Un espace convivial avec un accueil à l'écoute de vos besoins, un espace d'attente et un bar proposant boissons et pâtisseries.",
    image:
      "https://static.wixstatic.com/media/95a7b9_234b82d8697642cd81bfa3f9a69cecb1~mv2.png/v1/fill/w_600,h_600,al_c,q_85/ChatGPT-Image-18-57-35.png",
  },
  {
    icon: MapPin,
    label: "Accessibilité",
    desc: "Permettre à chaque professionnel de louer un espace selon ses besoins et son expérience, au cœur de Paris.",
    image:
      "https://static.wixstatic.com/media/95a7b9_bf47561963504ea6beab30b8a149d8dd~mv2.jpg/v1/fill/w_600,h_600,al_c,q_85/PHOTO-2026-02-24-16-26-58.jpg",
  },
];

const confortItems = [
  {
    icon: Coffee,
    label: "Un bar à café",
    desc: "Un espace pensé pour votre moment de détente et le confort de votre clientèle.",
    image:
      "https://static.wixstatic.com/media/95a7b9_471de42c88c54561a188deb1bab32ad7~mv2.jpg/v1/fill/w_400,h_400,al_c,q_85/external-file_edited.jpg",
  },
  {
    icon: UtensilsCrossed,
    label: "Une salle de restauration",
    desc: "Un espace chaleureux pour votre confort afin de récupérer au mieux d'une longue journée de travail.",
    image:
      "https://static.wixstatic.com/media/95a7b9_87253e2077f144e6a0c5c7a834b91c0f~mv2.png/v1/fill/w_400,h_400,al_c,q_85/ChatGPT-Image-22-42-40.png",
  },
  {
    icon: ConciergeBell,
    label: "Un service de réception",
    desc: "Un accueil à votre écoute, présent pour vous guider et offrir une expérience unique à chaque visite.",
    image:
      "https://static.wixstatic.com/media/95a7b9_7cb138f2c0564fb8b39471f6378915dc~mv2.png/v1/fill/w_400,h_400,al_c,q_85/ChatGPT-Image-16-16-20.png",
  },
];

export default function Home() {
  const [activeEspace, setActiveEspace] = useState(null);

  return (
    <AppShell>
      <div className="min-h-full bg-[#0a0a0a] text-white overflow-x-hidden">
        {/* HERO */}
        <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://static.wixstatic.com/media/95a7b9_bf47561963504ea6beab30b8a149d8dd~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_85/PHOTO-2026-02-24-16-26-58.jpg"
              alt="L'Appartement"
              className="w-full h-full object-cover opacity-30"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, #0a0a0a 0%, transparent 30%, transparent 70%, #0a0a0a 100%)",
              }}
            />
          </div>
          <div className="relative z-10 px-4 py-16">
            <p className="text-xs tracking-[0.5em] text-[#c9a84c] uppercase mb-6">
              Espace de Coworking beauté à Paris
            </p>
            <h1
              className="text-5xl md:text-7xl font-light text-white mb-6 leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              L&apos;Appartement
            </h1>
            <p
              className="text-2xl md:text-4xl text-[#c9a84c] italic mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              137 &amp; 80
            </p>
            <p className="text-base text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              Bienvenue dans l&apos;univers de L&apos;Appartement, un lieu dédié
              pour exercer votre passion. Situé au cœur de Paris, au 16 passage
              Lemoine et 80 rue de Cléry, ce sont des lieux où la productivité et
              le travail cohabitent harmonieusement avec l&apos;indépendance et
              le bien-être de votre clientèle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("home-espaces")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-[#c9a84c] text-black text-sm tracking-[0.2em] uppercase hover:bg-[#e8c96a] transition-all duration-300"
              >
                Découvrir nos espaces
              </button>
              <Link
                to="/reserver"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[#c9a84c]/60 text-[#c9a84c] text-sm tracking-wider hover:bg-[#c9a84c] hover:text-black transition-all duration-300"
              >
                Réserver <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ESPACES */}
        <section id="home-espaces" className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-[0.4em] text-[#c9a84c] uppercase mb-4">
                Nos Coworking
              </p>
              <h2
                className="text-4xl md:text-5xl font-light text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Deux espaces, un même art
              </h2>
              <p className="text-sm text-white/50 max-w-lg mx-auto">
                Choisissez votre coworking selon vos besoins et vos envies
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {espaces.map((espace) => (
                <div
                  key={espace.id}
                  className="group relative overflow-hidden rounded-sm cursor-pointer border border-white/10 hover:border-[#c9a84c]/50 transition-all duration-500"
                  onClick={() => setActiveEspace(espace)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setActiveEspace(espace);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={espace.image}
                      alt={espace.nom}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-8"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 60%)",
                    }}
                  >
                    <div className="flex items-center gap-2 text-[#c9a84c] text-xs tracking-widest uppercase mb-2">
                      <MapPin size={12} /> {espace.adresse}
                    </div>
                    <h3
                      className="text-4xl font-light text-white mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {espace.nom}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 leading-relaxed">
                      {espace.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="text-[#c9a84c]">{espace.superficie}</span>
                      <span className="w-px h-3 bg-white/20" />
                      <span>{espace.postes}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">{espace.detail}</p>
                    <div className="mt-5 flex items-center gap-2 text-white group-hover:text-[#c9a84c] transition-colors text-sm tracking-wider">
                      <Sparkles size={14} /> Visite 3D immersive{" "}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VISION */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://static.wixstatic.com/media/95a7b9_1c39e58735294204909b20507f828c75~mv2.png/v1/fill/w_1920,h_600,al_c,q_85/ChatGPT-Image-18-34-25.png"
              alt="Notre vision"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs tracking-[0.4em] text-[#c9a84c] uppercase mb-6">
              Notre vision du travail
            </p>
            <h2
              className="text-3xl md:text-5xl font-light text-white mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Plus qu&apos;un simple lieu de travail,
              <br />
              <span className="italic text-[#c9a84c]">un lieu de partage</span>
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              L&apos;Appartement propose une atmosphère stimulante et créative,
              combinant harmonieusement un environnement propice au travail.
              Notre équipe est là pour vous assurer une expérience unique à
              chaque visite.
            </p>
          </div>
        </section>

        {/* ATOUTS */}
        <section className="py-16 px-6 md:px-12 border-y border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] text-[#c9a84c] uppercase mb-4">
                Nos atouts
              </p>
              <h2
                className="text-3xl md:text-4xl font-light text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Réservez votre place dès maintenant
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {atouts.map((a) => (
                <div key={a.label} className="group text-center">
                  <div className="relative w-full aspect-square overflow-hidden rounded-sm mb-5 border border-white/10 group-hover:border-[#c9a84c]/40 transition-all">
                    <img
                      src={a.image}
                      alt={a.label}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 flex items-center justify-center border border-[#c9a84c]/50 text-[#c9a84c] bg-black/50 backdrop-blur-sm">
                        <a.icon size={20} />
                      </div>
                    </div>
                  </div>
                  <h3
                    className="text-xl text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {a.label}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {a.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONFORT */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] text-[#c9a84c] uppercase mb-4">
                Dans nos coworking
              </p>
              <h2
                className="text-3xl md:text-4xl font-light text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Un confort pour vous et vos clients
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {confortItems.map((item) => (
                <div
                  key={item.label}
                  className="group overflow-hidden rounded-sm border border-white/10 hover:border-[#c9a84c]/40 transition-all"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <item.icon size={18} className="text-[#c9a84c]" />
                      <h3
                        className="text-lg text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {item.label}
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — reste connecté : lien app interne */}
        <section className="py-24 px-6 text-center border-t border-white/10">
          <p className="text-xs tracking-[0.4em] text-[#c9a84c] uppercase mb-6">
            Votre espace
          </p>
          <h2
            className="text-4xl md:text-5xl font-light text-white mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Continuer dans
            <br />
            <span className="italic text-[#c9a84c]">l&apos;application</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/calendrier"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#c9a84c] text-black text-sm tracking-[0.25em] uppercase hover:bg-[#e8c96a] transition-all duration-300"
            >
              Calendrier <ArrowRight size={16} />
            </Link>
            <Link
              to="/reserver"
              className="inline-flex items-center gap-3 px-10 py-5 border border-[#c9a84c]/60 text-[#c9a84c] text-sm tracking-[0.2em] uppercase hover:bg-[#c9a84c] hover:text-black transition-all duration-300"
            >
              Réserver
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 py-10 px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-between text-xs text-white/40">
            <div>
              <p
                className="text-white text-sm mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                L&apos;Appartement 137 / 80
              </p>
              <p>
                {CONTACT.email} · {CONTACT.phoneFixe || CONTACT.phone}
              </p>
            </div>
            <p>© {SITE.copyrightYear} L&apos;Appartement — Coworking beauté</p>
          </div>
        </footer>

        {activeEspace && (
          <ImmersiveViewer
            espace={activeEspace}
            initialMode="3d"
            onClose={() => setActiveEspace(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
