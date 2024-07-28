import { useTranslations } from "next-intl";

export default function Index() {
  const t = useTranslations("Index");
  return (
    <div className="min-h-screen">
      <div className="container">
        <div className="grid min-h-screen">
          <div className="mt-auto">
            <h1 className="text-9xl font-black">{t("title")}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
