import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Ruler,
  Save,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteBodyMeasurement,
  fetchBodyMeasurements,
  upsertBodyMeasurement,
} from "../../services/bodyMeasurementService";
import { reportError } from "../../utils/errorHandler";
import { useLanguage } from "../../context/LanguageContext";

const todayKey = new Date().toISOString().split("T")[0];

const initialForm = {
  measured_at: todayKey,
  height_cm: "",
  weight_kg: "",
  chest_cm: "",
  waist_cm: "",
  hip_cm: "",
  arm_cm: "",
  thigh_cm: "",
  notes: "",
};

const measurementFields = [
  { key: "height_cm", labelPt: "Altura", labelEn: "Height", suffix: "cm" },
  { key: "weight_kg", labelPt: "Peso", labelEn: "Weight", suffix: "kg" },
  { key: "chest_cm", labelPt: "Peito", labelEn: "Chest", suffix: "cm" },
  { key: "waist_cm", labelPt: "Cintura", labelEn: "Waist", suffix: "cm" },
  { key: "hip_cm", labelPt: "Quadril", labelEn: "Hip", suffix: "cm" },
  { key: "arm_cm", labelPt: "Braço", labelEn: "Arm", suffix: "cm" },
  { key: "thigh_cm", labelPt: "Coxa", labelEn: "Thigh", suffix: "cm" },
];

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;

  const parsed = Number(String(value).replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatDate(dateKey, language) {
  if (!dateKey) return "";

  const [year, month, day] = String(dateKey).split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US");
}

function formatValue(value, suffix) {
  if (value === null || value === undefined || value === "") return "-";

  return `${Number(value).toFixed(1)} ${suffix}`;
}

function getDifference(current, previous, key) {
  const currentValue = Number(current?.[key]);
  const previousValue = Number(previous?.[key]);

  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return null;
  }

  return currentValue - previousValue;
}

function BodyMeasurements({ user }) {
  const { language } = useLanguage();
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const latestMeasurement = measurements[0] || null;
  const previousMeasurement = measurements[1] || null;
  const visibleMeasurements = showHistory ? measurements : measurements.slice(0, 3);

  const weightDelta = useMemo(() => {
    return getDifference(latestMeasurement, previousMeasurement, "weight_kg");
  }, [latestMeasurement, previousMeasurement]);

  useEffect(() => {
    loadMeasurements();
  }, [user?.id]);

  async function loadMeasurements() {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await fetchBodyMeasurements(user.id);

    if (error) {
      reportError(error, "Error loading body measurements.");
      setLoading(false);
      return;
    }

    setMeasurements(data || []);

    if (data?.[0]) {
      setForm((prev) => ({
        ...prev,
        height_cm: data[0].height_cm ?? "",
      }));
    }

    setLoading(false);
  }

  function updateFormField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function editMeasurement(measurement) {
    setForm({
      measured_at: measurement.measured_at || todayKey,
      height_cm: measurement.height_cm ?? "",
      weight_kg: measurement.weight_kg ?? "",
      chest_cm: measurement.chest_cm ?? "",
      waist_cm: measurement.waist_cm ?? "",
      hip_cm: measurement.hip_cm ?? "",
      arm_cm: measurement.arm_cm ?? "",
      thigh_cm: measurement.thigh_cm ?? "",
      notes: measurement.notes || "",
    });
  }

  async function saveMeasurement() {
    if (!form.measured_at) {
      toast.error(language === "pt" ? "Informe a data." : "Enter the date.");
      return;
    }

    const hasMeasurement = measurementFields.some((field) => {
      return toNumberOrNull(form[field.key]) !== null;
    });

    if (!hasMeasurement) {
      toast.error(
        language === "pt"
          ? "Informe pelo menos uma medida."
          : "Enter at least one measurement.",
      );
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      measured_at: form.measured_at,
      notes: form.notes.trim() || null,
    };

    measurementFields.forEach((field) => {
      payload[field.key] = toNumberOrNull(form[field.key]);
    });

    const { data, error } = await upsertBodyMeasurement(payload);

    if (error) {
      reportError(error);
      toast.error(
        language === "pt"
          ? "Não foi possível salvar as medidas."
          : "Could not save measurements.",
      );
      setSaving(false);
      return;
    }

    setMeasurements((prev) => {
      const withoutSameDate = prev.filter((item) => item.id !== data.id);
      return [data, ...withoutSameDate].sort((a, b) =>
        String(b.measured_at).localeCompare(String(a.measured_at)),
      );
    });

    toast.success(language === "pt" ? "Medidas salvas." : "Measurements saved.");
    setSaving(false);
  }

  async function removeMeasurement(measurement) {
    const confirmDelete = confirm(
      language === "pt"
        ? "Excluir este registro de medidas?"
        : "Delete this measurement record?",
    );

    if (!confirmDelete) return;

    setDeletingId(measurement.id);

    const { error } = await deleteBodyMeasurement(measurement.id, user.id);

    if (error) {
      reportError(error, "Error deleting body measurement.");
      setDeletingId(null);
      return;
    }

    setMeasurements((prev) => prev.filter((item) => item.id !== measurement.id));
    setDeletingId(null);
  }

  return (
    <div className="mt-6 sm:mt-10 space-y-6">
      <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:bg-white/5 dark:border-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-purple-500 text-xs font-black uppercase tracking-wide">
              {language === "pt" ? "Evolução corporal" : "Body progress"}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              {language === "pt" ? "Medidas" : "Measurements"}
            </h2>
            <p className="text-zinc-500 text-sm mt-2 max-w-2xl">
              {language === "pt"
                ? "Atualize seus dados semanalmente e compare só quando precisar."
                : "Update your data weekly and compare only when needed."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
            <SummaryTile
              icon={<Scale size={19} />}
              label={language === "pt" ? "Peso atual" : "Current weight"}
              value={formatValue(latestMeasurement?.weight_kg, "kg")}
            />
            <SummaryTile
              icon={<Ruler size={19} />}
              label={language === "pt" ? "Variação" : "Change"}
              value={
                weightDelta === null
                  ? "-"
                  : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
              }
              trend={weightDelta}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_1fr] gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:bg-white/5 dark:border-white/10">
          <h3 className="text-lg font-black">
            {language === "pt" ? "Atualizar medidas" : "Update measurements"}
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">
                {language === "pt" ? "Data" : "Date"}
              </span>
              <input
                type="date"
                value={form.measured_at}
                onChange={(event) =>
                  updateFormField("measured_at", event.target.value)
                }
                className="WorkoutInput mt-1"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {measurementFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-xs font-bold text-zinc-500">
                    {language === "pt" ? field.labelPt : field.labelEn} (
                    {field.suffix})
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    value={form[field.key]}
                    onChange={(event) =>
                      updateFormField(field.key, event.target.value)
                    }
                    className="WorkoutInput mt-1"
                  />
                </label>
              ))}
            </div>

            <label className="block">
              <span className="text-xs font-bold text-zinc-500">
                {language === "pt" ? "Observações" : "Notes"}
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => updateFormField("notes", event.target.value)}
                rows={3}
                className="WorkoutInput mt-1 resize-none"
              />
            </label>

            <button
              type="button"
              onClick={saveMeasurement}
              disabled={saving}
              className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {language === "pt" ? "Salvar medidas" : "Save measurements"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:bg-white/5 dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black">
                {language === "pt" ? "Últimos registros" : "Latest records"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {language === "pt"
                  ? "Abra o histórico completo só quando quiser comparar."
                  : "Open the full history only when you want to compare."}
              </p>
            </div>

            {measurements.length > 3 && (
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-black text-zinc-700 transition hover:border-purple-500 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
              >
                {showHistory
                  ? language === "pt"
                    ? "Mostrar menos"
                    : "Show less"
                  : language === "pt"
                    ? "Ver histórico"
                    : "View history"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="mt-6 flex items-center gap-3 text-zinc-500">
              <Loader2 className="animate-spin" size={20} />
              {language === "pt"
                ? "Carregando medidas..."
                : "Loading measurements..."}
            </div>
          ) : measurements.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-white/10">
              {language === "pt"
                ? "Nenhuma medida registrada ainda."
                : "No measurements logged yet."}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {visibleMeasurements.map((measurement) => {
                const originalIndex = measurements.findIndex(
                  (item) => item.id === measurement.id,
                );

                return (
                  <MeasurementRow
                    key={measurement.id}
                    deleting={deletingId === measurement.id}
                    language={language}
                    measurement={measurement}
                    previous={measurements[originalIndex + 1]}
                    onDelete={() => removeMeasurement(measurement)}
                    onEdit={() => editMeasurement(measurement)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ icon, label, value, trend = null }) {
  const TrendIcon = trend === null ? null : trend <= 0 ? TrendingDown : TrendingUp;

  return (
    <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 dark:bg-black/30 dark:border-white/10">
      <div className="flex items-center justify-between gap-2 text-zinc-500">
        {icon}
        {TrendIcon && (
          <TrendIcon
            size={17}
            className={trend <= 0 ? "text-green-500" : "text-orange-500"}
          />
        )}
      </div>
      <p className="text-xs font-bold text-zinc-500 mt-3">{label}</p>
      <p className="text-lg font-black mt-1">{value}</p>
    </div>
  );
}

function MeasurementRow({
  deleting,
  language,
  measurement,
  onDelete,
  onEdit,
  previous,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button type="button" onClick={onEdit} className="text-left min-w-0">
          <p className="text-xs font-black text-purple-500 uppercase tracking-wide">
            {formatDate(measurement.measured_at, language)}
          </p>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {measurementFields.slice(0, 4).map((field) => (
              <Metric
                key={field.key}
                current={measurement}
                field={field}
                language={language}
                previous={previous}
              />
            ))}
          </div>
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Trash2 size={17} />
          )}
        </button>
      </div>

      {measurement.notes && (
        <p className="mt-3 text-sm text-zinc-500">{measurement.notes}</p>
      )}
    </div>
  );
}

function Metric({ current, field, language, previous }) {
  const delta = getDifference(current, previous, field.key);

  return (
    <div className="rounded-xl bg-white border border-zinc-200 p-3 dark:bg-white/5 dark:border-white/10">
      <p className="text-[11px] font-bold text-zinc-500">
        {language === "pt" ? field.labelPt : field.labelEn}
      </p>
      <p className="font-black mt-1">
        {formatValue(current[field.key], field.suffix)}
      </p>
      {delta !== null && Math.abs(delta) >= 0.1 && (
        <p className="text-[11px] font-bold text-zinc-500 mt-1">
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)} {field.suffix}
        </p>
      )}
    </div>
  );
}

export default BodyMeasurements;
