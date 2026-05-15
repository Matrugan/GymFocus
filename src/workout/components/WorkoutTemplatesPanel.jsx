import { ClipboardList, Loader2, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function WorkoutTemplatesPanel({
  creatingTemplate,
  onCreateTemplate,
  templates,
}) {
  const { translate } = useLanguage();

  return (
    <div
      className="
        bg-zinc-50
        border
        border-zinc-200
        rounded-2xl
        p-4
        sm:p-5
        mb-6

        dark:bg-black/30
        dark:border-white/10
      "
    >
      <div className="mb-5">
        <h3 className="font-black text-lg sm:text-xl">
          {translate("Workout templates")}
        </h3>

        <p className="text-zinc-500 text-sm mt-1">
          {translate("Choose a ready-made plan and customize it later.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {templates.map((template) => (
          <div
            key={template.title}
            className="
              bg-white
              border
              border-zinc-200
              rounded-2xl
              p-4
              flex
              flex-col
              justify-between
              gap-4

              dark:bg-black/30
              dark:border-white/10
            "
          >
            <div>
              <div
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-purple-500/10
                  text-purple-500
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <ClipboardList size={21} />
              </div>

              <h4 className="font-black text-lg">{translate(template.title)}</h4>

              <p className="text-zinc-500 text-sm mt-2">
                {translate(template.description)}
              </p>

              <div className="mt-4 space-y-2">
                {Object.entries(template.focuses).map(([day, focus]) => (
                  <div
                    key={day}
                    className="
                      text-xs
                      px-3
                      py-2
                      rounded-xl
                      bg-zinc-100
                      text-zinc-600

                      dark:bg-white/5
                      dark:text-zinc-300
                    "
                  >
                    <strong>{translate(day)}</strong> - {translate(focus)}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-zinc-500 text-xs mb-3">
                {template.exercises.length} {translate("exercises included")}
              </p>

              <button
                onClick={() => onCreateTemplate(template)}
                disabled={creatingTemplate}
                className="
                  w-full
                  px-4
                  py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-purple-500
                  to-fuchsia-500
                  text-white
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-50
                  hover:scale-[1.02]
                  transition
                "
              >
                {creatingTemplate ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} />
                )}
                {translate("Use template")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutTemplatesPanel;
