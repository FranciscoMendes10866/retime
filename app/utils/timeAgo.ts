export function timeAgo(date: string): string {
  const currentDate = new Date();
  const inputDate = new Date(date);

  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    const isNow = seconds < 10;
    return isNow ? "Just now" : seconds + " seconds ago";
  } else if (minutes < 60) {
    return minutes + " minutes ago";
  } else if (hours < 24) {
    return hours + " hours ago";
  } else if (days < 7) {
    return days + " days ago";
  } else {
    const months = Math.floor(days / 30);
    return months + " months ago";
  }
}
