type Props = {
  isFollowing: boolean;
  loading?: boolean;
  onToggle: () => Promise<void> | void;
};

export default function FollowButton({ isFollowing, loading = false, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!loading) {
          void onToggle();
        }
      }}
      disabled={loading}
      className={`min-w-[128px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
        isFollowing
          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {loading ? "Working..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
