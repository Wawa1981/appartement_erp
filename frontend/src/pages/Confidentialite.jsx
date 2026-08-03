import { useTranslation } from "react-i18next";
import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { CONTACT } from "../data/bookingCatalog";

/** Politique de confidentialité (lien footer) */
export default function Confidentialite() {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.privacyTitle")}>
      <p className="text-xs text-[#7A6E62]">{t("legal.lastUpdate")}</p>
      <p>{t("legal.privacy.intro")}</p>

      <LegalSection title={t("legal.privacy.a1")}>
        <p>{t("legal.privacy.a1Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.privacy.a2")}>
        <p>{t("legal.privacy.a2Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.privacy.a3")}>
        <p>{t("legal.privacy.a3Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.privacy.a4")}>
        <p>{t("legal.privacy.a4Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.privacy.a5")}>
        <p>
          {t("legal.privacy.a5Body")}{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-[#B8956A]">
            {CONTACT.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
