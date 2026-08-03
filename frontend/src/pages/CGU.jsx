import { useTranslation } from "react-i18next";
import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { CONTACT } from "../data/bookingCatalog";

export default function CGU() {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.cguTitle")}>
      <p className="text-xs text-[#7A6E62]">{t("legal.lastUpdate")}</p>
      <p>{t("legal.cgu.intro")}</p>

      <LegalSection title={t("legal.cgu.a1")}>
        <p>{t("legal.cgu.a1Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a2")}>
        <p>{t("legal.cgu.a2Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a3")}>
        <p>{t("legal.cgu.a3Body")}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("legal.cgu.a3Li1")}</li>
          <li>{t("legal.cgu.a3Li2")}</li>
          <li>{t("legal.cgu.a3Li3")}</li>
          <li>{t("legal.cgu.a3Li4")}</li>
        </ul>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a4")}>
        <p>{t("legal.cgu.a4Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a5")}>
        <p>{t("legal.cgu.a5Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a6")}>
        <p>{t("legal.cgu.a6Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a7")}>
        <p>{t("legal.cgu.a7Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a8")}>
        <p>{t("legal.cgu.a8Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a9")}>
        <p>{t("legal.cgu.a9Body")}</p>
      </LegalSection>

      <LegalSection title={t("legal.cgu.a10")}>
        <p>
          {t("legal.cgu.a10Body")}{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-[#B8956A]">
            {CONTACT.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
