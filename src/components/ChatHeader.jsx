import { ArrowLeft } from "lucide-react";

function ChatHeader({
  selectedUser,
  online,
  onBack,
}) {
  return (
    <div
      className="
        h-20
        sticky
        top-0
        z-50
        px-6
        flex
        items-center
        justify-between
        glass-card
        glass-card--strong
        border-0
        smooth-motion
      "
    >
      <div className="flex items-center gap-4">
        {/* BACK BUTTON MOBILE */}
        <button
          onClick={onBack}
          className="
            lg:hidden
            p-2
            rounded-xl
            bg-white/5
            hover:bg-white/10
            smooth-motion
          "
        >
          <ArrowLeft size={20} />
        </button>

        {/* AVATAR */}
        <div className="relative">
          <img
            src={
              selectedUser?.avatar_url ||
              "https://i.pravatar.cc/150"
            }
            alt=""
            className="
              w-14
              h-14
              rounded-full
              object-cover
              border
              border-white/10
            "
          />

          {/* ONLINE STATUS */}
          <div
            className={`
              absolute
              bottom-0
              right-0
              w-4
              h-4
              rounded-full
              border-2
              border-zinc-950
              ${
                online
                  ? "bg-green-500"
                  : "bg-zinc-500"
              }
            `}
          />
        </div>

        {/* USER INFO */}
        <div>
          <h2 className="font-bold text-lg">
            {selectedUser?.username}
          </h2>

          <p className="text-sm text-zinc-400">
            {online
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;