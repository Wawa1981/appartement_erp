import { useTranslation } from "react-i18next";
import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { CONTACT, SITE } from "../data/bookingCatalog";
import { LEGAL } from "../data/siteConfig";

export default function MentionsLegales() {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.mentionsTitle")}>
      <p className="text-xs text-[#7A6E62]">{t("legal.lastUpdate")}</p>

      <LegalSection title={t("legal.ml.editeur")}>
        <p>{t("legal.ml.editeurBody")}</p>
        <p>
          <strong>{t("legal.ml.raisonSociale")}</strong> {LEGAL.raisonSociale}
        </p>
        <p>
          <strong>{t("legal.ml.forme")}</strong>{" "}
          {t(LEGAL.formeJuridiqueKey)} ({LEGAL.formeJuridique})
        </p>
        <p>
          <strong>{t("legal.ml.capital")}</strong> {LEGAL.capital}
        </p>
        <p>
          <strong>{t("legal.ml.rcs")}</strong> {LEGAL.rcsDisplay}
        </p>
        <p>
          <strong>{t("legal.ml.siren")}</strong> {LEGAL.sirenDisplay}
        </p>
        <p>
          <strong>{t("legal.ml.siret")}</strong> {LEGAL.siretDisplay}
        </p>
        <p>
          <strong>{t("legal.ml.tva")}</strong> {LEGAL.tva}
        </p>
        <p>
          <strong>{t("legal.ml.naf")}</strong> {LEGAL.naf} —{" "}
          {t(LEGAL.nafLabelKey)}
        </p>
        <p>
          <strong>{t("legal.ml.dateCreation")}</strong>{" "}
          {LEGAL.dateCreationDisplay}
        </p>
        <p>
          <strong>{t("legal.ml.marque")}</strong> {t("footer.brandSpaces")}
        </p>
        <p>
          <strong>{t("legal.ml.siege")}</strong> {LEGAL.siege}
        </p>
        <p>
          <strong>{t("legal.ml.espaces")}</strong>
          <br />
          {t("footer.addressLemoine")}
          <br />
          {t("footer.addressClery")}
        </p>
        <p>
          <strong>{t("legal.ml.email")}</strong>{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-[#B8956A]">
            {CONTACT.email}
          </a>
        </p>
        <p>
          <strong>{t("legal.ml.tel")}</strong>{" "}
          <a href={`tel:${CONTACT.phoneRaw}`} className="text-[#B8956A]">
            {CONTACT.phone}
          </a>
          {CONTACT.phoneFixe ? (
            <>
              {" / "}
              <a href={`tel:${CONTACT.phoneFixeRaw}`} className="text-[#B8956A]">
                {CONTACT.phoneFixe}
              </a>
            </>
          ) : null}
        </p>
      </LegalSection>

      <LegalSection title={t("legal.ml.directeur")}>
        <p>
          {t("legal.ml.directeurBody", {
            name: LEGAL.directeurPublication,
            role: t("legal.ml.rolePresident"),
            email: CONTACT.email,
          })}
        </p>
      </LegalSection>

      <LegalSection title={t("legal.ml.hebergement")}>
        <p>{t("legal.ml.hebergementBody", { email: CONTACT.email })}</p>
      </LegalSection>

      <LegalSection title={t("legal.ml.propriete")}>
        <p>{t("legal.ml.proprieteBody")}</p>
      </LegalSection>

      <LegalSection title={t("legal.ml.donnees")}>
        <p>{t("legal.ml.donneesBody", { email: CONTACT.email })}</p>
      </LegalSection>

      <LegalSection title={t("legal.ml.cookies")}>
        <p>{t("legal.ml.cookiesBody")}</p>
      </LegalSection>

      <LegalSection title={t("legal.ml.droit")}>
        <p>{t("legal.ml.droitBody")}</p>
      </LegalSection>

      <p className="text-[11px] text-[#9C8E7E] pt-2">
        {t("footer.rights", { year: SITE.copyrightYear })}
      </p>
    </LegalLayout>
  );
}
