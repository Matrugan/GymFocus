import { Loader2, Plus } from "lucide-react";

function CreateWorkoutPlanForm({
  createWorkoutPlan,
  creatingPlan,
  newPlan,
  setNewPlan,
  showCreatePlan,
}) {
  if (!showCreatePlan) {
    return null;
  }

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
      <h3 className="font-black text-lg sm:text-xl mb-4">
        Create workout plan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <input
          type="text"
          placeholder="Ex: Treino ABC - Hipertrofia"
          value={newPlan.title}
          onChange={(e) =>
            setNewPlan((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="WorkoutInput"
        />

        <input
          type="text"
          placeholder="DescriÃ§Ã£o opcional"
          value={newPlan.description}
          onChange={(e) =>
            setNewPlan((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className="WorkoutInput"
        />

        <button
          onClick={createWorkoutPlan}
          disabled={creatingPlan}
          className="
            w-full
            md:w-auto
            px-5
            py-3
            rounded-2xl
            bg-zinc-950
            text-white
            font-bold
            flex
            items-center
            justify-center
            gap-2
            disabled:opacity-50

            dark:bg-white
            dark:text-black
          "
        >
          {creatingPlan ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          Create
        </button>
      </div>
    </div>
  );
}

export default CreateWorkoutPlanForm;
