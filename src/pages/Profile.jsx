import { useEffect, useState } from "react"

import { useParams } from "react-router-dom"

import { supabase } from "../lib/supabase"

function Profile() {

  const { username } = useParams()

  const [profile, setProfile] = useState(null)

  useEffect(() => {

    getProfile()

  }, [])

  async function getProfile() {

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (error) {

      console.log(error)

      return

    }

    setProfile(data)

  }

  if (!profile) {

    return (
      <div className="text-white p-10">
        Loading...
      </div>
    )

  }

  return (

    <section className="
      min-h-screen
      bg-black
      text-white
      p-10
    ">

      <div className="
        max-w-4xl
        mx-auto
      ">

        <div className="
          bg-white/5
          border
          border-white/10
          rounded-3xl
          p-10
          backdrop-blur-xl
        ">

          <img
            src={profile.avatar_url}
            alt=""
            className="
              w-40
              h-40
              rounded-full
              object-cover
              border-4
              border-purple-500
            "
          />

          <h1 className="
            text-5xl
            font-black
            mt-8
          ">
            {profile.username}
          </h1>

          <p className="
            text-zinc-400
            mt-4
            text-xl
          ">
            {profile.bio}
          </p>

        </div>

      </div>

    </section>
  )
}

export default Profile