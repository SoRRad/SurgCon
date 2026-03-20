function BookmarkButton({ isBookmarked, onToggle }) {
  return (
    <button
      type="button"
      className={isBookmarked ? 'bookmark-button is-active' : 'bookmark-button'}
      onClick={onToggle}
      aria-pressed={isBookmarked}
    >
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  );
}

export default BookmarkButton;
