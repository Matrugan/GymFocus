import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

function WorkoutCalendar({ user }) {

  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {

    getWorkouts();

  }, []);

  async function getWorkouts() {

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id);

    if (error) {

      console.log(error);

      return;

    }

    setWorkouts(data);

  }

  const last7Days = [...Array(7)].map((_, index) => {

    const date = new Date();

    date.setDate(date.getDate() - index);

    return date.toISOString().split("T")[0];

  }).reverse();

  function didWorkout(date) {

    return workouts.some(
      (workout) => workout.workout_date === date
    );

  }

  return (

    <div
      className="
        mt-14
        bg-white/5
        border
        border-white/10
        backdrop-blur-xl
        rounded-3xl
        p-8
      "
    >

      <h2 className="text-2xl font-black mb-8">
        Weekly Consistency
      </h2>

      <div className="flex gap-4 flex-wrap">

        {last7Days.map((day) => (

          <div
            key={day}
            className="
              flex
              flex-col
              items-center
              gap-3
            "
          >

            <div
              className={`
                w-16
                h-16
                rounded-2xl
                flex
                items-center
                justify-center
                font-bold
                text-lg
                transition
                ${didWorkout(day)
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500"
                  : "bg-zinc-800 text-zinc-500"}
              `}
            >

              {new Date(day)
                .toLocaleDateString("en-US", {
                  weekday: "short",
                })
                .charAt(0)}

            </div>

            <span className="text-sm text-zinc-500">
              {day.slice(8)}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default WorkoutCalendar;